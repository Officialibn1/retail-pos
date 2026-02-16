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
import { toast } from "sonner";
import { useCreateBackupMutation } from "@/lib/store/api";

interface BackupConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BackupConfirmationDialog({
	open,
	onOpenChange,
}: BackupConfirmationDialogProps) {
	const [createBackup, { isLoading }] = useCreateBackupMutation();

	const handleBackup = async () => {
		try {
			const blob = await createBackup().unwrap();

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;

			// Create filename with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const filename = `database-backup-${timestamp}.xlsx`;

			a.download = filename;
			document.body.appendChild(a);
			a.click();

			// Cleanup
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success("Backup Successful", {
				description: "Database backup has been downloaded successfully.",
			});

			onOpenChange(false);
		} catch (error: any) {
			console.error("Backup error:", error);
			toast.error("Backup Failed", {
				description:
					error?.data?.error?.message ||
					error?.message ||
					"Failed to create database backup. Please try again.",
			});
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
