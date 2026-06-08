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
import { Calendar, User, MapPin, Monitor, Tag, Hash } from "lucide-react";

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

	// Parse metadata — Prisma returns it as JsonValue (object | null)
	const meta =
		activity.metadata && typeof activity.metadata === "object"
			? (activity.metadata as Record<string, unknown>)
			: null;

	const entityType = meta?.entityType as string | undefined;
	const entityId = meta?.entityId as string | undefined;
	const changes = meta?.changes as
		| Record<string, [unknown, unknown]>
		| undefined;

	// Remaining metadata fields (excluding the well-known ones)
	const extraMeta = meta
		? Object.entries(meta).filter(
				([k]) => !["entityType", "entityId", "changes"].includes(k),
			)
		: [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[620px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Activity Details
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Complete information about this activity log entry
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Action */}
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

					{/* Entity type + ID (from metadata) */}
					{(entityType || entityId) && (
						<div className='grid grid-cols-2 gap-3'>
							{entityType && (
								<div className='flex items-start gap-2'>
									<Tag className='h-4 w-4 text-brand-main-500 mt-0.5 shrink-0' />
									<div>
										<p className='text-sm font-medium text-brand-main-700'>
											Entity Type
										</p>
										<p className='text-sm text-brand-main-600'>{entityType}</p>
									</div>
								</div>
							)}
							{entityId && (
								<div className='flex items-start gap-2'>
									<Hash className='h-4 w-4 text-brand-main-500 mt-0.5 shrink-0' />
									<div>
										<p className='text-sm font-medium text-brand-main-700'>
											Entity ID
										</p>
										<p className='text-xs text-brand-main-600 font-mono break-all'>
											{entityId}
										</p>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Changes diff */}
					{changes && Object.keys(changes).length > 0 && (
						<div className='space-y-2'>
							<p className='text-sm font-medium text-brand-main-700'>
								Changes
							</p>
							<div className='rounded-md border overflow-hidden text-xs'>
								<table className='w-full'>
									<thead>
										<tr className='bg-brand-main-50 border-b'>
											<th className='text-left px-3 py-2 text-brand-main-700 font-semibold'>
												Field
											</th>
											<th className='text-left px-3 py-2 text-red-700 font-semibold'>
												Before
											</th>
											<th className='text-left px-3 py-2 text-green-700 font-semibold'>
												After
											</th>
										</tr>
									</thead>
									<tbody>
										{Object.entries(changes).map(([field, [before, after]]) => (
											<tr key={field} className='border-b last:border-0'>
												<td className='px-3 py-2 font-medium text-brand-main-700'>
													{field}
												</td>
												<td className='px-3 py-2 text-red-600 font-mono'>
													{before === null || before === undefined
														? <span className='text-brand-main-400 italic'>—</span>
														: String(before)}
												</td>
												<td className='px-3 py-2 text-green-700 font-mono'>
													{after === null || after === undefined
														? <span className='text-brand-main-400 italic'>—</span>
														: String(after)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{/* Extra metadata fields */}
					{extraMeta.length > 0 && (
						<div className='space-y-2'>
							<p className='text-sm font-medium text-brand-main-700'>
								Additional Info
							</p>
							<div className='rounded-md bg-brand-main-50 border p-3 space-y-1'>
								{extraMeta.map(([key, value]) => (
									<div key={key} className='flex gap-2 text-xs'>
										<span className='font-medium text-brand-main-700 shrink-0'>
											{key}:
										</span>
										<span className='text-brand-main-600 font-mono break-all'>
											{typeof value === "object"
												? JSON.stringify(value)
												: String(value)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* User */}
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

					{/* Free-text details */}
					<div className='space-y-2'>
						<p className='text-sm font-medium text-brand-main-700'>Details</p>
						<div className='rounded-md bg-brand-main-50 border p-3'>
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

					<div className='pt-2 border-t'>
						<p className='text-xs text-brand-main-500'>
							Activity ID: {activity.id}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
