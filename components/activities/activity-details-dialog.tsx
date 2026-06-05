"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ActivityLogWithUser } from "@/lib/prisma-extended-types";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, Monitor } from "lucide-react";

interface ActivityDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	activity: ActivityLogWithUser | null;
}

export function ActivityDetailsDialog({
	open,
	onOpenChange,
	activity,
}: ActivityDetailsDialogProps) {
	if (!activity) return null;

	const createdAt =
		typeof activity.createdAt === "string"
			? new Date(activity.createdAt)
			: activity.createdAt;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Activity Details
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Complete information about this activity log
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Action Badge */}
					<div className='flex items-center gap-2'>
						<span className='text-sm font-medium text-brand-main-700'>
							Action:
						</span>
						<Badge
							variant='secondary'
							className='bg-brand-main-100 text-brand-main-800 hover:bg-brand-main-100'>
							{activity.action}
						</Badge>
					</div>

					{/* User Information */}
					<div className='flex items-start gap-2'>
						<User className='h-4 w-4 text-brand-main-600 mt-0.5' />
						<div className='flex-1'>
							<p className='text-sm font-medium text-brand-main-700'>User</p>
							<p className='text-sm text-brand-main-600'>
								{activity.user.name}
							</p>
							<p className='text-xs text-brand-main-500'>
								{activity.user.email}
							</p>
						</div>
					</div>

					{/* Timestamp */}
					<div className='flex items-start gap-2'>
						<Calendar className='h-4 w-4 text-brand-main-600 mt-0.5' />
						<div className='flex-1'>
							<p className='text-sm font-medium text-brand-main-700'>
								Timestamp
							</p>
							<p className='text-sm text-brand-main-600'>
								{createdAt.toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
							<p className='text-xs text-brand-main-500'>
								{createdAt.toLocaleTimeString("en-US", {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
								})}
							</p>
						</div>
					</div>

					{/* Details */}
					<div className='space-y-2'>
						<p className='text-sm font-medium text-brand-main-700'>Details</p>
						<div className='rounded-md bg-brand-main-50 border   p-3'>
							<p className='text-sm text-brand-main-800 whitespace-pre-wrap break-words'>
								{activity.details}
							</p>
						</div>
					</div>

					{/* IP Address */}
					{activity.ipAddress && (
						<div className='flex items-start gap-2'>
							<MapPin className='h-4 w-4 text-brand-main-600 mt-0.5' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-brand-main-700'>
									IP Address
								</p>
								<p className='text-sm text-brand-main-600 font-mono'>
									{activity.ipAddress}
								</p>
							</div>
						</div>
					)}

					{/* User Agent */}
					{activity.userAgent && (
						<div className='flex items-start gap-2'>
							<Monitor className='h-4 w-4 text-brand-main-600 mt-0.5' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-brand-main-700'>
									User Agent
								</p>
								<p className='text-xs text-brand-main-600 break-all'>
									{activity.userAgent}
								</p>
							</div>
						</div>
					)}

					{/* Activity ID */}
					<div className='pt-2 border-t  '>
						<p className='text-xs text-brand-main-500'>
							Activity ID: {activity.id}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
