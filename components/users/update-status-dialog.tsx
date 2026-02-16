"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface UpdateStatusDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userName: string;
	currentStatus: UserStatus;
	onStatusUpdate: (userId: string, newStatus: UserStatus) => Promise<void>;
}

export function UpdateStatusDialog({
	open,
	onOpenChange,
	userId,
	userName,
	currentStatus,
	onStatusUpdate,
}: UpdateStatusDialogProps) {
	const [selectedStatus, setSelectedStatus] =
		useState<UserStatus>(currentStatus);
	const [isLoading, setIsLoading] = useState(false);

	// Reset selected status to current status when dialog opens
	useEffect(() => {
		if (open) {
			setSelectedStatus(currentStatus);
		}
	}, [open, currentStatus]);

	const handleSubmit = async () => {
		if (selectedStatus === currentStatus) {
			onOpenChange(false);
			return;
		}

		setIsLoading(true);
		try {
			await onStatusUpdate(userId, selectedStatus);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update status:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getStatusBadge = (status: UserStatus) => {
		switch (status) {
			case UserStatus.ACTIVE:
				return (
					<Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
						<CheckCircle2 className='h-3 w-3 mr-1' />
						Active
					</Badge>
				);
			case UserStatus.SUSPENDED:
				return (
					<Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>
						<AlertCircle className='h-3 w-3 mr-1' />
						Suspended
					</Badge>
				);
			case UserStatus.BLOCKED:
				return (
					<Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
						<XCircle className='h-3 w-3 mr-1' />
						Blocked
					</Badge>
				);
		}
	};

	const getStatusDescription = (status: UserStatus) => {
		switch (status) {
			case UserStatus.ACTIVE:
				return "User has full access to all operations based on their role permissions.";
			case UserStatus.SUSPENDED:
				return "User can login and view data but cannot perform any create, update, or delete operations.";
			case UserStatus.BLOCKED:
				return "User cannot login or access the application. All authentication attempts will be rejected.";
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Update User Status</DialogTitle>
					<DialogDescription>
						Change the status for{" "}
						<span className='font-semibold'>{userName}</span>
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>
							Current Status:
						</span>
						{getStatusBadge(currentStatus)}
					</div>

					<div className='space-y-3'>
						<Label>Select New Status</Label>
						<RadioGroup
							value={selectedStatus}
							onValueChange={(value) => setSelectedStatus(value as UserStatus)}
							disabled={isLoading}
							className='space-y-3'>
							<Label className='flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer'>
								<RadioGroupItem
									value={UserStatus.ACTIVE}
									id='active'
									disabled={isLoading}
								/>
								<div className='flex-1 space-y-1'>
									<Label
										htmlFor='active'
										className='font-medium cursor-pointer flex items-center gap-2'>
										<CheckCircle2 className='h-4 w-4 text-green-600' />
										Active
									</Label>
									<p className='text-sm text-muted-foreground'>
										{getStatusDescription(UserStatus.ACTIVE)}
									</p>
								</div>
							</Label>

							<Label className='flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer'>
								<RadioGroupItem
									value={UserStatus.SUSPENDED}
									id='suspended'
									disabled={isLoading}
								/>
								<div className='flex-1 space-y-1'>
									<Label
										htmlFor='suspended'
										className='font-medium cursor-pointer flex items-center gap-2'>
										<AlertCircle className='h-4 w-4 text-yellow-600' />
										Suspended
									</Label>
									<p className='text-sm text-muted-foreground'>
										{getStatusDescription(UserStatus.SUSPENDED)}
									</p>
								</div>
							</Label>

							<Label className='flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent cursor-pointer'>
								<RadioGroupItem
									value={UserStatus.BLOCKED}
									id='blocked'
									disabled={isLoading}
								/>
								<div className='flex-1 space-y-1'>
									<Label
										htmlFor='blocked'
										className='font-medium cursor-pointer flex items-center gap-2'>
										<XCircle className='h-4 w-4 text-red-600' />
										Blocked
									</Label>
									<p className='text-sm text-muted-foreground'>
										{getStatusDescription(UserStatus.BLOCKED)}
									</p>
								</div>
							</Label>
						</RadioGroup>
					</div>
				</div>

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isLoading}>
						Cancel
					</Button>
					<Button
						type='button'
						onClick={handleSubmit}
						disabled={isLoading || selectedStatus === currentStatus}>
						{isLoading ? (
							<>
								<Spinner />
								Updating...
							</>
						) : (
							"Update Status"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
