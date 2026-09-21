"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
	createPurchaseOrderSchema,
	type CreatePurchaseOrderInput,
} from "@/lib/validations/purchase-order.schema";
import { useGetSuppliersQuery, useGetInventoryQuery } from "@/lib/store/api";
import { Plus, Trash2 } from "lucide-react";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { formatNaira } from "@/lib/utils";

interface CreatePurchaseOrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreatePurchaseOrderInput, form: any) => void;
	isCreating: boolean;
}

export function CreatePurchaseOrderDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: CreatePurchaseOrderDialogProps) {
	const c = useCurrencySymbol();
	const { data: suppliersData } = useGetSuppliersQuery();
	const { data: inventoryData } = useGetInventoryQuery();

	const suppliers = suppliersData?.suppliers || [];
	const inventoryItems = inventoryData || [];

	const form = useForm<CreatePurchaseOrderInput>({
		resolver: zodResolver(createPurchaseOrderSchema),
		defaultValues: {
			supplierId: "",
			notes: "",
			items: [{ inventoryItemId: "", quantity: 1, unitCost: 0 }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	const watchItems = form.watch("items");
	const totalCost = watchItems.reduce(
		(sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0),
		0,
	);

	const onSubmit = (data: CreatePurchaseOrderInput) => {
		onSave(data, form);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-brand-main-950">
						New Purchase Order
					</DialogTitle>
					<DialogDescription className="text-brand-main-800">
						Create a purchase order for a supplier.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Supplier */}
						<FormField
							control={form.control}
							name="supplierId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Supplier *</FormLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										disabled={isCreating}>
										<FormControl>
											<SelectTrigger className="focus:border-brand-main-400 w-full">
												<SelectValue placeholder="Select a supplier" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
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

						{/* Line items */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<FormLabel>Items *</FormLabel>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isCreating}
									onClick={() =>
										append({ inventoryItemId: "", quantity: 1, unitCost: 0 })
									}
									className="text-brand-main-700 hover:bg-brand-main-50 h-7 text-xs">
									<Plus className="h-3 w-3 mr-1" />
									Add Line
								</Button>
							</div>

							<div className="space-y-3">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-start">
										{/* Item selector */}
										<FormField
											control={form.control}
											name={`items.${index}.inventoryItemId`}
											render={({ field: f }) => (
												<FormItem>
													{index === 0 && (
														<FormLabel className="text-xs text-slate-500">
															Product
														</FormLabel>
													)}
													<Select
														value={f.value}
														onValueChange={f.onChange}
														disabled={isCreating}>
														<FormControl>
															<SelectTrigger className="focus:border-brand-main-400 w-full">
																<SelectValue placeholder="Select product" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{inventoryItems.map((item) => (
																<SelectItem key={item.id} value={item.id}>
																	{item.name}{" "}
																	<span className="text-slate-400 text-xs">
																		({item.sku})
																	</span>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Quantity */}
										<FormField
											control={form.control}
											name={`items.${index}.quantity`}
											render={({ field: f }) => (
												<FormItem>
													{index === 0 && (
														<FormLabel className="text-xs text-slate-500">
															Qty
														</FormLabel>
													)}
													<FormControl>
														<Input
															{...f}
															type="number"
															min={1}
															disabled={isCreating}
															className="focus:border-brand-main-400"
															onChange={(e) =>
																f.onChange(
																	e.target.value ? Number(e.target.value) : 1,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Unit cost */}
										<FormField
											control={form.control}
											name={`items.${index}.unitCost`}
											render={({ field: f }) => (
												<FormItem>
													{index === 0 && (
														<FormLabel className="text-xs text-slate-500">
															Unit Cost
														</FormLabel>
													)}
													<FormControl>
														<Input
															{...f}
															type="number"
															step="0.01"
															min={0}
															disabled={isCreating}
															className="focus:border-brand-main-400"
															onChange={(e) =>
																f.onChange(
																	e.target.value ? Number(e.target.value) : 0,
																)
															}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										{/* Remove */}
										<div className={index === 0 ? "pt-6" : ""}>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												disabled={isCreating || fields.length === 1}
												onClick={() => remove(index)}
												className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Total */}
						<div className="rounded-md bg-brand-main-50 border border-brand-main-200 px-4 py-3 flex items-center justify-between">
							<span className="text-sm font-medium text-brand-main-800">
								Estimated Total Cost
							</span>
							<span className="text-lg font-bold text-brand-main-900">
								{formatNaira(totalCost, c)}
							</span>
						</div>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											value={field.value || ""}
											rows={2}
											disabled={isCreating}
											placeholder="Any notes about this order..."
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								disabled={isCreating}
								onClick={() => onOpenChange(false)}
								className="hover:bg-brand-main-50 flex-1">
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isCreating}
								className="bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1">
								{isCreating ? <Spinner /> : "Create Order"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
