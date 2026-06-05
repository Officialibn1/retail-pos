"use client";

import { useState, useRef, useEffect } from "react";
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
import { useGetCategoriesQuery } from "@/lib/store/api";
import { Spinner } from "@/components/ui/spinner";
import {
	createInventoryItemSchema,
	type CreateInventoryItemInput,
} from "@/lib/validations/inventory.schema";

interface AddItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (item: CreateInventoryItemInput) => void;
	isCreatingItem: boolean;
}

export function AddItemDialog({
	open,
	onOpenChange,
	onSave,
	isCreatingItem,
}: AddItemDialogProps) {
	const [isScanning, setIsScanning] = useState(false);
	const scannerRef = useRef(null);

	const form = useForm<CreateInventoryItemInput>({
		resolver: zodResolver(createInventoryItemSchema),
		defaultValues: {
			name: "",
			description: "",
			sku: "",
			price: 0,
			stock: 0,
			reorderLevel: 10,
			categoryId: "",
			barcode: "",
		},
	});

	const { data: categoriesData, isLoading: categoriesLoading } =
		useGetCategoriesQuery();

	const categories = categoriesData?.categories || [];

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
			setIsScanning(false);
		}
	}, [open, form]);

	const onSubmit = (data: CreateInventoryItemInput) => {
		onSave(data);
		form.reset();
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
					<DialogTitle className='text-brand-main-800'>
						Add New Item
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Add a new item to your inventory. Fill in all the required
						information.
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
												disabled={isCreatingItem || categoriesLoading}
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
												disabled={isCreatingItem || categoriesLoading}
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
											disabled={isCreatingItem || categoriesLoading}
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
											disabled={isCreatingItem || categoriesLoading}>
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
													disabled={
														isCreatingItem || categoriesLoading || isScanning
													}
													className='  focus:border-brand-main-400 flex-grow'
												/>
											</FormControl>
											<Button
												type='button'
												variant='outline'
												disabled={
													isCreatingItem || categoriesLoading || isScanning
												}
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
							<div className='relative w-full h-64 border   rounded-lg overflow-hidden'>
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

						<div className='grid grid-cols-2 gap-4'>
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
												disabled={isCreatingItem || categoriesLoading}
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
								name='stock'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Quantity *
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												type='number'
												disabled={isCreatingItem || categoriesLoading}
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
						</div>
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
											disabled={isCreatingItem || categoriesLoading}
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

						<DialogFooter>
							<Button
								type='button'
								disabled={isCreatingItem || categoriesLoading}
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
								disabled={isCreatingItem || categoriesLoading}
								className='bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1'>
								{isCreatingItem ? <Spinner /> : "Add Item"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
