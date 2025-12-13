"use client";

import type React from "react";
import { useState, useRef } from "react"; // Import useRef
import { BarcodeScanner, DetectedBarcode } from "react-barcode-scanner"; // Import BarcodeScanner
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { InventoryItem } from "@/lib/types";
import { Camera } from "lucide-react"; // Import Camera icon
import { QR_SCANNER_FORMAT_OPTIONS } from "@/lib/utils";
import { useGetCategoriesQuery } from "@/lib/store/api";
import { Spinner } from "../ui/spinner";

interface AddItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		item: Omit<
			InventoryItem,
			"id" | "createdAt" | "updatedAt" | "stock" | "deletedAt"
		>,
	) => void;
	isCreatingItem: boolean;
}

export function AddItemDialog({
	open,
	onOpenChange,
	onSave,
	isCreatingItem,
}: AddItemDialogProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		sku: "",
		price: "",
		cost: "",
		stock: "",
		categoryId: "",
		barcode: "",
	});
	const [isScanning, setIsScanning] = useState(false); // State to control scanner visibility
	const scannerRef = useRef(null); // Ref for the scanner component

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newItem = {
			name: formData.name,
			description: formData.description,
			sku: formData.sku,
			price: Number.parseFloat(formData.price),
			cost: Number.parseFloat(formData.cost),
			stock: Number.parseInt(formData.stock),
			categoryId: formData.categoryId,
			barcode: formData.barcode || null,
		};

		onSave(newItem);

		// Reset form
		setFormData({
			name: "",
			description: "",
			sku: "",
			price: "",
			cost: "",
			stock: "",
			categoryId: "",
			barcode: "",
		});

		setIsScanning(false); // Close scanner when dialog is closed or form is saved
	};

	const handleScan = (decodedBarcodes: DetectedBarcode[]) => {
		setFormData({ ...formData, barcode: decodedBarcodes[0].rawValue });
		setIsScanning(false); // Stop scanning after a successful scan
	};

	const { isLoading, data: categories, isError } = useGetCategoriesQuery();

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Add New Item
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Add a new item to your inventory. Fill in all the required
						information.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label
								htmlFor='name'
								className='text-brand-main-700'>
								Product Name *
							</Label>
							<Input
								disabled={isCreatingItem || isLoading || isError}
								id='name'
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='sku'
								className='text-brand-main-700'>
								SKU *
							</Label>
							<Input
								id='sku'
								disabled={isCreatingItem || isLoading || isError}
								value={formData.sku}
								onChange={(e) =>
									setFormData({ ...formData, sku: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='description'
							className='text-brand-main-700'>
							Description
						</Label>
						<Textarea
							id='description'
							disabled={isCreatingItem || isLoading || isError}
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							className='border-brand-main-200 focus:border-brand-main-400'
							rows={3}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label
								htmlFor='categoryId'
								className='text-brand-main-700'>
								Category *
							</Label>
							<Select
								value={formData.categoryId}
								onValueChange={(value) =>
									setFormData({ ...formData, categoryId: value })
								}
								disabled={isCreatingItem || isLoading || isError}>
								<SelectTrigger className='border-brand-main-200 focus:border-brand-main-400'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{categories &&
										categories.categories.map((category) => (
											<SelectItem
												disabled={isCreatingItem || isLoading || isError}
												key={category.name}
												value={category.id}>
												{category.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='barcode'
								className='text-brand-main-700'>
								Barcode
							</Label>
							<div className='flex items-center gap-2'>
								<Input
									id='barcode'
									disabled={
										isCreatingItem || isLoading || isError || isScanning
									}
									value={formData.barcode}
									onChange={(e) =>
										setFormData({ ...formData, barcode: e.target.value })
									}
									className='border-brand-main-200 focus:border-brand-main-400 flex-grow'
								/>
								<Button
									type='button'
									variant='outline'
									disabled={
										isCreatingItem || isLoading || isError || isScanning
									}
									onClick={() => setIsScanning(!isScanning)}
									className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 h-9 w-9 p-0'
									aria-label='Scan Barcode'>
									<Camera className='h-4 w-4' />
								</Button>
							</div>
						</div>
					</div>

					{isScanning && (
						<div className='relative w-full h-64 border border-brand-main-200 rounded-lg overflow-hidden'>
							<BarcodeScanner
								ref={scannerRef}
								onCapture={handleScan}
								onError={() => setIsScanning(false)}
								width={300}
								height={200}
								trackConstraints={{
									facingMode: {
										ideal: "environment",
									},
								}}
								options={{
									formats: QR_SCANNER_FORMAT_OPTIONS,
								}}
							/>
						</div>
					)}

					<div className='grid grid-cols-3 gap-4'>
						<div className='space-y-2'>
							<Label
								htmlFor='price'
								className='text-brand-main-700'>
								Selling Price *
							</Label>
							<Input
								id='price'
								disabled={isCreatingItem || isLoading || isError}
								type='number'
								step='0.01'
								value={formData.price}
								onChange={(e) =>
									setFormData({ ...formData, price: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='cost'
								className='text-brand-main-700'>
								Cost Price *
							</Label>
							<Input
								id='cost'
								disabled={isCreatingItem || isLoading || isError}
								type='number'
								step='0.01'
								value={formData.cost}
								onChange={(e) =>
									setFormData({ ...formData, cost: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='stock'
								className='text-brand-main-700'>
								Quantity *
							</Label>
							<Input
								id='stock'
								disabled={isCreatingItem || isLoading || isError}
								type='number'
								value={formData.stock}
								onChange={(e) =>
									setFormData({ ...formData, stock: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type='button'
							disabled={isCreatingItem || isLoading || isError}
							variant='outline'
							onClick={() => {
								onOpenChange(false);
								setIsScanning(false); // Ensure scanner is off when dialog closes
							}}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isCreatingItem || isLoading || isError}
							className='bg-brand-main-600 hover:bg-brand-main-700 text-white flex-1'>
							{isCreatingItem ? <Spinner /> : "Add Item"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
