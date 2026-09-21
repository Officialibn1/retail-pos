"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PurchaseOrderWithDetails } from "@/lib/prisma-extended-types";
import { formatNaira } from "@/lib/utils";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2, Truck, Package } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
	ORDERED: "bg-blue-100 text-blue-800 border-blue-200",
	RECEIVED: "bg-green-100 text-green-800 border-green-200",
	CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

interface PurchaseOrderDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	order: PurchaseOrderWithDetails | null;
	onReceive: (id: string) => void;
	onCancel: (id: string) => void;
	isReceiving: boolean;
	isCancelling: boolean;
}

export function PurchaseOrderDetailDialog({
	open,
	onOpenChange,
	order,
	onReceive,
	onCancel,
	isReceiving,
	isCancelling,
}: PurchaseOrderDetailDialogProps) {
	const c = useCurrencySymbol();

	if (!order) return null;

	const canReceive = order.status === "PENDING" || order.status === "ORDERED";
	const canCancel = order.status === "PENDING" || order.status === "ORDERED";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-brand-main-800">
						Purchase Order
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Status + meta */}
					<div className="flex items-center justify-between flex-wrap gap-2">
						<Badge
							className={`${STATUS_COLORS[order.status]} border text-sm px-3 py-1`}>
							{order.status}
						</Badge>
						<span className="text-sm text-slate-500">
							Created {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}
						</span>
					</div>

					{/* Supplier */}
					<div className="rounded-md border p-3 space-y-1 bg-slate-50">
						<div className="flex items-center gap-2 text-sm font-medium text-brand-main-800">
							<Truck className="h-4 w-4" />
							{order.supplier.name}
						</div>
						{order.supplier.phone && (
							<p className="text-xs text-slate-500">{order.supplier.phone}</p>
						)}
						{order.supplier.email && (
							<p className="text-xs text-slate-500">{order.supplier.email}</p>
						)}
					</div>

					{/* Line items */}
					<div>
						<div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
							<Package className="h-4 w-4" />
							Items ({order.items.length})
						</div>
						<div className="divide-y border rounded-md overflow-hidden">
							<div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-3 py-2 bg-slate-50 text-xs font-medium text-slate-500">
								<span>Product</span>
								<span className="text-right">Qty</span>
								<span className="text-right">Unit Cost</span>
								<span className="text-right">Subtotal</span>
							</div>
							{order.items.map((item) => (
								<div
									key={item.id}
									className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-3 py-2 text-sm items-center">
									<div>
										<p className="font-medium text-slate-800">
											{item.inventoryItem.name}
										</p>
										<p className="text-xs text-slate-400">
											{item.inventoryItem.sku}
										</p>
									</div>
									<p className="text-right text-slate-700">{item.quantity}</p>
									<p className="text-right text-slate-700">
										{formatNaira(Number(item.unitCost), c)}
									</p>
									<p className="text-right font-medium text-slate-800">
										{formatNaira(Number(item.unitCost) * item.quantity, c)}
									</p>
								</div>
							))}
						</div>
					</div>

					<Separator />

					{/* Total */}
					<div className="flex justify-between items-center">
						<span className="font-medium text-slate-700">Total Cost</span>
						<span className="text-xl font-bold text-brand-main-900">
							{formatNaira(Number(order.totalCost), c)}
						</span>
					</div>

					{/* Received at */}
					{order.receivedAt && (
						<p className="text-sm text-green-700 font-medium">
							Received on {format(new Date(order.receivedAt), "dd MMM yyyy, HH:mm")}
						</p>
					)}

					{/* Notes */}
					{order.notes && (
						<div className="rounded-md bg-slate-50 border p-3 text-sm text-slate-600">
							<p className="font-medium text-slate-700 mb-1">Notes</p>
							{order.notes}
						</div>
					)}

					{/* Actions */}
					{(canReceive || canCancel) && (
						<div className="flex gap-2 pt-2">
							{canReceive && (
								<Button
									className="flex-1 bg-green-600 hover:bg-green-700 text-white"
									disabled={isReceiving || isCancelling}
									onClick={() => onReceive(order.id)}>
									{isReceiving ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<CheckCircle className="h-4 w-4 mr-2" />
									)}
									Mark as Received
								</Button>
							)}
							{canCancel && (
								<Button
									variant="outline"
									className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
									disabled={isReceiving || isCancelling}
									onClick={() => onCancel(order.id)}>
									{isCancelling ? (
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
									) : (
										<XCircle className="h-4 w-4 mr-2" />
									)}
									Cancel Order
								</Button>
							)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
