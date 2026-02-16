"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackupConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BackupConfirmationDialog({
	open,
	onOpenChange,
}: BackupConfirmationDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const handleBackup = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/backup", {
				method: "POST",
				credentials: "include", // Include cookies for authentication
			});

			if (!response.ok) {
				// Try to parse error response
				const errorData = await response.json().catch(() => ({
					error: { message: "Backup failed" },
				}));
				throw new Error(errorData.error?.message || "Backup failed");
			}

			// Get the blob from response
			const blob = await response.blob();

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;

			// Extract filename from Content-Disposition header or use default
			const contentDisposition = response.headers.get("Content-Disposition");
			const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
			const filename = filenameMatch
				? filenameMatch[1]
				: `database-backup-${new Date().toISOString()}.xlsx`;

			a.download = filename;
			document.body.appendChild(a);
			a.click();

			// Cleanup
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast({
				title: "Backup Successful",
				description: "Database backup has been downloaded successfully.",
			});

			onOpenChange(false);
		} catch (error) {
			console.error("Backup error:", error);
			toast({
				title: "Backup Failed",
				description:
					error instanceof Error
						? error.message
						: "Failed to create database backup. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-brand-main-800'>
						<Download className='h-5 w-5' />
						Confirm Database Backup
					</DialogTitle>
					<DialogDescription className='space-y-3 pt-2'>
						<p>
							Are you sure you want to perform a backup of the current database
							snapshot?
						</p>
						<div className='flex items-start gap-2 rounded-md bg-yellow-50 p-3 border border-yellow-200'>
							<AlertTriangle className='h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5' />
							<div className='text-sm text-yellow-800'>
								<p className='font-semibold mb-1'>Important Warning:</p>
								<p>
									Do not perform any operations such as sales, inventory
									updates, or user management while the backup process is
									ongoing. This ensures data consistency in the backup file.
								</p>
							</div>
						</div>
						<p className='text-sm'>
							The backup will be downloaded as an Excel file containing all
							database tables including users, sales, inventory, customers, and
							activity logs.
						</p>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className='flex-col-reverse sm:flex-row sm:justify-end gap-2'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50'>
						Cancel
					</Button>
					<Button
						onClick={handleBackup}
						disabled={isLoading}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
						{isLoading ? "Creating Backup..." : "Proceed with Backup"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
