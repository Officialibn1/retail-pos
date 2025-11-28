"use client";

import { mockUsers } from "@/lib/dummy-data/mock-users";
import { format } from "date-fns";
import { formatNaira } from "@/lib/utils";

interface ReceiptItem {
	id: string;
	inventoryItemId: string;
	name: string;
	unitPrice: number;
	quantity: number;
	discount?: number;
	total: number;
}

interface ReceiptSale {
	id: string;
	saleNumber?: string;
	items: ReceiptItem[];
	subtotal: number;
	tax: number;
	discount: number;
	total: number;
	paymentMethod: string;
	salesPersonId?: string;
	salesperson?: string;
	createdAt?: string | Date;
	customer?: string;
}

interface ReceiptTemplateProps {
	sale: ReceiptSale;
	storeName?: string;
	storeAddress?: string;
	storePhone?: string;
}

export function ReceiptTemplate({
	sale,
	storeName = "Retail Store POS",
	storeAddress = "123 Main Street, City, State 12345",
	storePhone = "(555) 123-4567",
}: ReceiptTemplateProps) {
	const subtotal = sale.items.reduce(
		(sum, item) => sum + item.unitPrice * item.quantity,
		0,
	);
	const tax = sale.tax || 0;
	const discount = sale.discount || 0;
	const total = subtotal + tax - discount;

	const findSalesPersonName = (salePersonId: string) => {
		const salePerson = mockUsers.find((u) => u.id === salePersonId);
		return salePerson ? salePerson.name : "";
	};

	return (
		<div className='receipt-template bg-white text-black p-6 max-w-sm mx-auto font-mono text-sm'>
			{/* Store Header */}
			<div className='text-center border-b border-gray-300 pb-4 mb-4'>
				<h1 className='font-bold text-lg'>{storeName}</h1>
				<p className='text-xs'>{storeAddress}</p>
				<p className='text-xs'>{storePhone}</p>
			</div>

			{/* Receipt Info */}
			<div className='mb-4 text-xs'>
				<div className='flex justify-between'>
					<span>Receipt #:</span>
					<span>{sale.saleNumber || sale.id}</span>
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
					<span>
						{sale.salesperson ||
							(sale.salesPersonId
								? findSalesPersonName(sale.salesPersonId)
								: "N/A")}
					</span>
				</div>
				{sale.customer && (
					<div className='flex justify-between'>
						<span>Customer:</span>
						<span>{sale.customer}</span>
					</div>
				)}
			</div>

			{/* Items */}
			<div className='border-t border-gray-300 pt-2 mb-4'>
				{sale.items.map((item, index) => (
					<div
						key={index}
						className='mb-2'>
						<div className='flex justify-between'>
							<span className='truncate flex-1'>{item.name}</span>
							<span className='ml-2'>{formatNaira(item.unitPrice)}</span>
						</div>
						<div className='flex justify-between text-xs text-gray-600'>
							<span>Qty: {item.quantity}</span>
							<span>{formatNaira(item.unitPrice * item.quantity)}</span>
						</div>
					</div>
				))}
			</div>

			{/* Totals */}
			<div className='border-t border-gray-300 pt-2 mb-4'>
				<div className='flex justify-between'>
					<span>Subtotal:</span>
					<span>{formatNaira(subtotal)}</span>
				</div>
				{discount > 0 && (
					<div className='flex justify-between'>
						<span>Discount:</span>
						<span>-{formatNaira(discount)}</span>
					</div>
				)}
				<div className='flex justify-between'>
					<span>Tax:</span>
					<span>{formatNaira(tax)}</span>
				</div>
				<div className='flex justify-between font-bold text-lg border-t border-gray-300 pt-1'>
					<span>Total:</span>
					<span>{formatNaira(total)}</span>
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
					<span>{formatNaira(total)}</span>
				</div>
			</div>

			{/* Footer */}
			<div className='text-center text-xs border-t border-gray-300 pt-4'>
				<p>Thank you for your business!</p>
				<p>Please keep this receipt for your records</p>
				<p className='mt-2'>Return Policy: 30 days with receipt</p>
			</div>
		</div>
	);
}
