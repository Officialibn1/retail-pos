"use client";

import { useState } from "react";
import type { Sale } from "@/lib/types";
import { ReceiptTemplate } from "./receipt-template";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";

interface ReceiptPrintDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptPrintDialog({
  sale,
  open,
  onOpenChange,
}: ReceiptPrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (!sale) return;

    setIsPrinting(true);

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print receipts");
      setIsPrinting(false);
      return;
    }

    // Get the receipt HTML
    const receiptElement = document.querySelector(".receipt-template");
    if (!receiptElement) {
      setIsPrinting(false);
      return;
    }

    // Create print-friendly HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.id}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: monospace; }
            .receipt-template { max-width: none; margin: 0; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptElement.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsPrinting(false);
    }, 500);
  };

  const handleDownload = () => {
    if (!sale) return;

    const receiptElement = document.querySelector(".receipt-template");
    if (!receiptElement) return;

    // Create downloadable HTML
    const downloadHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.id}</title>
          <style>
            body { margin: 20px; font-family: monospace; }
            .receipt-template { max-width: none; margin: 0; }
          </style>
        </head>
        <body>
          ${receiptElement.outerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([downloadHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${sale.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Receipt Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          <ReceiptTemplate sale={sale} />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
