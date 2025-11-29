"use client";

import type React from "react";

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

interface EditItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: InventoryItem | null;
	onSave: (item: InventoryItem) => void;
}

export function EditItemDialog({
	open,
	onOpenChange,
	item,
	onSave,
}: EditItemDialogProps) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		sku: "",
		price: "",
		cost: "",
		quantity: "",
		category: "",
		barcode: "",
	});

	useEffect(() => {
		if (item) {
			setFormData({
				name: item.name,
				description: item.description,
				sku: item.sku,
				price: item.price.toString(),
				cost: item.cost.toString(),
				quantity: item.quantity.toString(),
				category: item.category,
				barcode: item.barcode || "",
			});
		}
	}, [item]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!item) return;

		const updatedItem: InventoryItem = {
			...item,
			name: formData.name,
			description: formData.description,
			sku: formData.sku,
			price: Number.parseFloat(formData.price),
			cost: Number.parseFloat(formData.cost),
			quantity: Number.parseInt(formData.quantity),
			category: formData.category,
			barcode: formData.barcode || undefined,
			updatedAt: new Date(),
		};

		onSave(updatedItem);
		onOpenChange(false);
	};

	const categories = [
		"Electronics",
		"Accessories",
		"Clothing",
		"Books",
		"Home & Garden",
	];

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>Edit Item</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Update the item information. Make sure all required fields are
						filled.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label
								htmlFor='edit-name'
								className='text-brand-main-700'>
								Product Name *
							</Label>
							<Input
								id='edit-name'
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
								htmlFor='edit-sku'
								className='text-brand-main-700'>
								SKU *
							</Label>
							<Input
								id='edit-sku'
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
							htmlFor='edit-description'
							className='text-brand-main-700'>
							Description
						</Label>
						<Textarea
							id='edit-description'
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
								htmlFor='edit-category'
								className='text-brand-main-700'>
								Category *
							</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}>
								<SelectTrigger className='border-brand-main-200 focus:border-brand-main-400'>
									<SelectValue placeholder='Select category' />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem
											key={category}
											value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label
								htmlFor='edit-barcode'
								className='text-brand-main-700'>
								Barcode
							</Label>
							<Input
								id='edit-barcode'
								value={formData.barcode}
								onChange={(e) =>
									setFormData({ ...formData, barcode: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<div className='space-y-2'>
							<Label
								htmlFor='edit-price'
								className='text-brand-main-700'>
								Selling Price *
							</Label>
							<Input
								id='edit-price'
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
								htmlFor='edit-cost'
								className='text-brand-main-700'>
								Cost Price *
							</Label>
							<Input
								id='edit-cost'
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
								htmlFor='edit-quantity'
								className='text-brand-main-700'>
								Quantity *
							</Label>
							<Input
								id='edit-quantity'
								type='number'
								value={formData.quantity}
								onChange={(e) =>
									setFormData({ ...formData, quantity: e.target.value })
								}
								className='border-brand-main-200 focus:border-brand-main-400'
								required
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50'>
							Cancel
						</Button>
						<Button
							type='submit'
							className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
