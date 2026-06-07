"use client";

import { format } from "date-fns";
import { formatNaira } from "@/lib/utils";
import { SaleWithDetails } from "@/lib/services/sale.service";
import { useGetStoreSettingsQuery } from "@/lib/store/api";

interface ReceiptTemplateProps {
	sale: SaleWithDetails;
}

export function ReceiptTemplate({ sale }: ReceiptTemplateProps) {
	const { data: storeData } = useGetStoreSettingsQuery();
	const store = storeData?.settings;

	return (
		<div className='receipt-template bg-white text-black p-6 max-w-sm mx-auto font-mono text-sm'>
			{/* Store Header */}
			<div className='text-center border-b border-gray-300 pb-4 mb-4'>
				<h1 className='font-bold text-lg'>{store?.name}</h1>
				<p className='text-xs'>{store?.address}</p>
				<p className='text-xs'>{store?.phone}</p>
				{store?.email && <p className='text-xs'>{store.email}</p>}
			</div>

			{/* Receipt Info */}
			<div className='mb-4 text-xs'>
				<div className='flex justify-between'>
					<span>Receipt #:</span>
					<span>{sale.id.slice(0, 8)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Date:</span>
					<span>
						{sale.createdAt
							? format(new Date(sale.createdAt), "MM/dd/yyyy HH:mm")
							: format(new Date(), "MM/dd/yyyy HH:mm")}
					</span>
				</div>
				<div className='flex justify-between'>
					<span>Cashier:</span>
					<span>{sale.user.name}</span>
				</div>

				{sale.customer && (
					<div className='border-t my-4 pt-4'>
						{(sale.customer.name ||
							sale.customer.email ||
							sale.customer.phone) && (
							<>
								<h1 className='font-medium'>Customer Details: </h1>
								{sale.customer.name && (
									<div className='flex justify-between'>
										<span>Customer:</span>
										<span>{sale.customer.name}</span>
									</div>
								)}
								{sale.customer.email && (
									<div className='flex justify-between'>
										<span>Email:</span>
										<span className='text-xs'>{sale.customer.email}</span>
									</div>
								)}
								{sale.customer.phone && (
									<div className='flex justify-between'>
										<span>Phone:</span>
										<span>{sale.customer.phone}</span>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>

			{/* Items */}
			<div className='border-t border-gray-300 pt-2 mb-4'>
				{sale.items.map((item, index) => (
					<div key={index} className='mb-2'>
						<div className='flex justify-between'>
							<span className='truncate flex-1'>{item.inventoryItem.name}</span>
							<span className='ml-2'>{formatNaira(item.price)}</span>
						</div>
						<div className='flex justify-between text-xs text-gray-600'>
							<span>Qty: {item.quantity}</span>
							<span>{formatNaira(item.price * item.quantity)}</span>
						</div>
						{item.note && (
							<p className='text-xs text-gray-500 italic mt-0.5'>
								↳ {item.note}
							</p>
						)}
					</div>
				))}
			</div>

			{/* Totals */}
			<div className='border-t border-gray-300 pt-2 mb-4'>
				<div className='flex justify-between'>
					<span>Subtotal:</span>
					<span>{formatNaira(sale.subTotal)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Discount:</span>
					<span>-{formatNaira(sale.discountAmount || 0)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Tax:</span>
					<span>{formatNaira(sale.taxAmount || 0)}</span>
				</div>
				<div className='flex justify-between font-bold text-lg border-t border-gray-300 pt-1'>
					<span>Total:</span>
					<span>{formatNaira(sale.total)}</span>
				</div>
			</div>

			{/* Payment Info */}
			<div className='border-t border-gray-300 pt-2 mb-4 text-xs'>
				<div className='flex justify-between'>
					<span>Payment Method:</span>
					<span className='capitalize'>{sale.paymentMethod}</span>
				</div>
				<div className='flex justify-between'>
					<span>Amount Paid:</span>
					<span>{formatNaira(sale.amountPaid ?? sale.total)}</span>
				</div>
				<div className='flex justify-between'>
					<span>Change Given:</span>
					<span>{formatNaira(sale.changeGiven || 0)}</span>
				</div>
			</div>

			{/* Footer */}
			<div className='text-center text-xs border-t border-gray-300 pt-4'>
				<p>Thank you for your patronage!</p>
				<p>Please keep this receipt for your records</p>
			</div>
		</div>
	);
}
