"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, User, CheckCircle, XCircle } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { SaleWithDetails } from "@/lib/services/sale.service";

interface PendingOrderCardProps {
	sale: SaleWithDetails;
	onComplete: (saleId: string) => void;
	onCancel: (saleId: string) => void;
	isProcessing: boolean;
	showCreatorName?: boolean;
}

export function PendingOrderCard({
	sale,
	onComplete,
	onCancel,
	isProcessing,
	showCreatorName = false,
}: PendingOrderCardProps) {
	const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
	const truncatedId = sale.id.slice(0, 8);

	return (
		<Card className='border-brand-main-200 hover:border-brand-main-300 transition-colors'>
			<CardContent className=''>
				<div className='space-y-3'>
					{/* Header with Order ID and Time */}
					<div className='flex items-start justify-between'>
						<div className='space-y-1'>
							<div className='flex items-center gap-2'>
								<Badge
									variant='outline'
									className='border-brand-main-300 text-brand-main-700 font-mono text-xs'>
									#{truncatedId}
								</Badge>
								<div className='flex items-center gap-1 text-xs text-brand-main-600'>
									<Clock className='h-3 w-3' />
									<span>
										{formatDistanceToNow(new Date(sale.createdAt), {
											addSuffix: true,
										})}
									</span>
								</div>
							</div>
							<div className='w-full flex gap-4 items-center'>
								{showCreatorName && (
									<div className='flex items-center gap-1 text-xs text-brand-main-600'>
										<User className='h-3 w-3' />
										<span>{sale.user.name}</span>
									</div>
								)}

								{sale.customer && (
									<div className='flex items-center gap-1 text-xs text-brand-main-600'>
										Customer: <span>{sale.customer.name}</span>
									</div>
								)}
							</div>
						</div>
						<div className='text-right'>
							<div className='text-lg font-semibold text-brand-main-800'>
								{formatNaira(Number(sale.total))}
							</div>
						</div>
					</div>

					{/* Item Count */}
					<div className='flex items-center gap-1 text-sm text-brand-main-700'>
						<ShoppingBag className='h-4 w-4' />
						<span>
							{itemCount} {itemCount === 1 ? "item" : "items"}
						</span>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-2 pt-2'>
						<Button
							onClick={() => onComplete(sale.id)}
							disabled={isProcessing}
							className='flex-1 bg-brand-main-600 hover:bg-brand-main-700 text-white'
							size='sm'>
							<CheckCircle className='h-4 w-4 mr-1' />
							Complete
						</Button>
						<Button
							onClick={() => onCancel(sale.id)}
							disabled={isProcessing}
							variant='outline'
							className='flex-1 border-red-300 text-red-600 hover:bg-red-100 bg-red-50/50 hover:text-red-700'
							size='sm'>
							<XCircle className='h-4 w-4 mr-1' />
							Cancel
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
