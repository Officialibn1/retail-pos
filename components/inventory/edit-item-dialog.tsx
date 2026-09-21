"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarcodeScanner, DetectedBarcode } from "react-barcode-scanner";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Camera } from "lucide-react";
import { QR_SCANNER_FORMAT_OPTIONS } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import {
	updateInventoryItemSchema,
	type UpdateInventoryItemInput,
} from "@/lib/validations/inventory.schema";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";
import { useGetCategoriesQuery, useGetSuppliersQuery } from "@/lib/store/api";

interface EditItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: InventoryItemWithCategory | null;
	onSave: (data: UpdateInventoryItemInput) => void;
	isUpdating?: boolean;
}

export function EditItemDialog({
	open,
	onOpenChange,
	item,
	onSave,
	isUpdating = false,
}: EditItemDialogProps) {
	const [isScanning, setIsScanning] = useState(false);
	const scannerRef = useRef(null);
	const form = useForm<UpdateInventoryItemInput>({
		resolver: zodResolver(updateInventoryItemSchema),
		defaultValues: {
			name: "",
			description: "",
			sku: "",
			price: 0,
			cost: undefined,
			categoryId: "",
			barcode: "",
			reorderLevel: 10,
			supplierId: "",
		},
	});

	const { data: categoriesData, isLoading: categoriesLoading } =
		useGetCategoriesQuery();
	const { data: suppliersData } = useGetSuppliersQuery();

	const categories = categoriesData?.categories || [];
	const suppliers = suppliersData?.suppliers || [];

	// Pre-fill form with current item data when dialog opens
	useEffect(() => {
		if (open && item) {
			form.reset({
				name: item.name,
				description: item.description || "",
				sku: item.sku,
				price: Number(item.price),
				cost: item.cost !== null && item.cost !== undefined ? Number(item.cost) : undefined,
				categoryId: item.categoryId,
				barcode: item.barcode || "",
				reorderLevel: item.reorderLevel ?? 10,
				supplierId: (item as any).supplierId || "",
			});
		}
	}, [open, item, form]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
			setIsScanning(false);
		}
	}, [open, form]);

	const onSubmit = (data: UpdateInventoryItemInput) => {
		onSave(data);
		setIsScanning(false);
	};

	const handleScan = (decodedBarcodes: DetectedBarcode[]) => {
		form.setValue("barcode", decodedBarcodes[0].rawValue);
		setIsScanning(false);
	};

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

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Product Name *
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isUpdating || categoriesLoading}
												className='  focus:border-brand-main-400'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='sku'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>SKU *</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={isUpdating || categoriesLoading}
												className='  focus:border-brand-main-400'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Description
									</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											value={field.value || ""}
											disabled={isUpdating || categoriesLoading}
											className='  focus:border-brand-main-400'
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='categoryId'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Category *
										</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={isUpdating || categoriesLoading}>
											<FormControl>
												<SelectTrigger className='  focus:border-brand-main-400 w-full'>
													<SelectValue placeholder='Select category' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem
														key={category.id}
														value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='barcode'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Barcode
										</FormLabel>
										<div className='flex items-center gap-2'>
											<FormControl>
												<Input
													{...field}
													value={field.value || ""}
													disabled={isUpdating || categoriesLoading || isScanning}
													className='  focus:border-brand-main-400 flex-grow'
												/>
											</FormControl>
											<Button
												type='button'
												variant='outline'
												disabled={isUpdating || categoriesLoading || isScanning}
												onClick={() => setIsScanning(!isScanning)}
												className='  text-brand-main-700 hover:bg-brand-main-50 h-9 w-9 p-0'
												aria-label='Scan Barcode'>
												<Camera className='h-4 w-4' />
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{isScanning && (
							<div className='relative w-full h-64 border rounded-lg overflow-hidden'>
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

						<FormField
							control={form.control}
							name='price'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Selling Price *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type='number'
											step='0.01'
											disabled={isUpdating || categoriesLoading}
											className='  focus:border-brand-main-400'
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : "",
												)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='cost'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>Cost Price</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value ?? ""}
											type='number'
											step='0.01'
											min={0}
											disabled={isUpdating || categoriesLoading}
											className='  focus:border-brand-main-400'
											onChange={(e) =>
												field.onChange(
													e.target.value !== "" ? Number(e.target.value) : null,
												)
											}
										/>
									</FormControl>
									<p className='text-xs text-slate-500'>
										Purchase/supplier cost — used for profit analysis
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{suppliers.length > 0 && (
							<FormField
								control={form.control}
								name='supplierId'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>Supplier</FormLabel>
										<Select
											value={field.value || ""}
											onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
											disabled={isUpdating || categoriesLoading}>
											<FormControl>
												<SelectTrigger className='  focus:border-brand-main-400 w-full'>
													<SelectValue placeholder='No supplier assigned' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value='none'>No supplier</SelectItem>
												{suppliers.map((s) => (
													<SelectItem key={s.id} value={s.id}>
														{s.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name='reorderLevel'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Reorder Level
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type='number'
											min={0}
											disabled={isUpdating || categoriesLoading}
											className='  focus:border-brand-main-400'
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : 0,
												)
											}
										/>
									</FormControl>
									<p className='text-xs text-brand-main-500'>
										Alert threshold — you'll be notified when stock hits this level
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='rounded-md bg-blue-50 border border-blue-200 p-3'>
							<p className='text-sm text-blue-800'>
								<span className='font-medium'>Note:</span> To adjust stock
								quantity, use "Adjust Stock" from the actions menu. Current
								stock: <span className='font-semibold'>{item?.stock || 0}</span>
							</p>
						</div>

						<DialogFooter>
							<Button
								type='button'
								disabled={isUpdating || categoriesLoading}
								variant='outline'
								onClick={() => {
									onOpenChange(false);
									setIsScanning(false);
								}}
								className='  text-brand-main-700 hover:bg-brand-main-50 flex-1'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isUpdating || categoriesLoading}
								className='bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1'>
								{isUpdating ? <Spinner /> : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
