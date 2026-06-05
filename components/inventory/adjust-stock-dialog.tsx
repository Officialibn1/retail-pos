"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
	FormDescription,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
	adjustStockSchema,
	type AdjustStockInput,
} from "@/lib/validations/inventory.schema";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";

interface AdjustStockDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: InventoryItemWithCategory | null;
	onSave: (itemId: string, data: AdjustStockInput) => void;
	isAdjusting?: boolean;
}

const STOCK_REASONS = [
	{ value: "RESTOCK", label: "Restock" },
	{ value: "DAMAGE", label: "Damage" },
	{ value: "THEFT", label: "Theft" },
	{ value: "ADJUSTMENT", label: "Adjustment" },
	{ value: "RETURN", label: "Return" },
] as const;

export function AdjustStockDialog({
	open,
	onOpenChange,
	item,
	onSave,
	isAdjusting = false,
}: AdjustStockDialogProps) {
	const form = useForm<AdjustStockInput>({
		resolver: zodResolver(adjustStockSchema),
		defaultValues: {
			quantity: 0,
			reason: "ADJUSTMENT",
			notes: "",
		},
	});

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: AdjustStockInput) => {
		if (!item) return;
		onSave(item.id, data);
	};

	const quantity = form.watch("quantity");
	const newStock = item ? item.stock + (quantity || 0) : 0;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Adjust Stock
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Adjust the stock quantity for <b>{item?.name}</b>. Current stock:{" "}
						<b>{item?.stock}</b>
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'>
						<FormField
							control={form.control}
							name='quantity'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Quantity Adjustment *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type='number'
											disabled={isAdjusting}
											className='  focus:border-brand-main-400'
											placeholder='Enter positive or negative number'
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : 0,
												)
											}
										/>
									</FormControl>
									<FormDescription>
										Use positive numbers to add stock, negative to reduce.
										{quantity !== 0 && (
											<span className='block mt-1 font-medium'>
												New stock will be:{" "}
												<span
													className={
														newStock < 0
															? "text-red-600"
															: newStock < 10
																? "text-amber-600"
																: "text-green-600"
													}>
													{newStock}
												</span>
											</span>
										)}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='reason'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Reason *
									</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isAdjusting}>
										<FormControl>
											<SelectTrigger className='  focus:border-brand-main-400 w-full'>
												<SelectValue placeholder='Select reason' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{STOCK_REASONS.map((reason) => (
												<SelectItem
													key={reason.value}
													value={reason.value}>
													{reason.label}
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
							name='notes'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>Notes</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											value={field.value || ""}
											disabled={isAdjusting}
											className='  focus:border-brand-main-400'
											rows={3}
											placeholder='Compulsary notes about this adjustment'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type='button'
								disabled={isAdjusting}
								variant='outline'
								onClick={() => onOpenChange(false)}
								className='  text-brand-main-700 hover:bg-brand-main-50 flex-1'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isAdjusting || quantity === 0}
								className='bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1'>
								{isAdjusting ? <Spinner /> : "Adjust Stock"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
