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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import {
	updateSupplierSchema,
	type UpdateSupplierInput,
} from "@/lib/validations/supplier.schema";
import { SupplierWithCounts } from "@/lib/prisma-extended-types";
import { useGetInventoryQuery } from "@/lib/store/api";
import { MultiSelect } from "@/components/ui/multi-select";

interface EditSupplierDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	supplier: SupplierWithCounts | null;
	onSave: (data: UpdateSupplierInput) => void;
	isUpdating: boolean;
}

export function EditSupplierDialog({
	open,
	onOpenChange,
	supplier,
	onSave,
	isUpdating,
}: EditSupplierDialogProps) {
	const form = useForm<UpdateSupplierInput>({
		resolver: zodResolver(updateSupplierSchema),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			address: "",
			notes: "",
			inventoryItemIds: [],
		},
	});

	// Show items that have no supplier OR already belong to this supplier
	const { data: inventoryData } = useGetInventoryQuery();
	const availableItems = (inventoryData || []).filter(
		(item) => !item.supplierId || item.supplierId === supplier?.id,
	);
	const itemOptions = availableItems.map((item) => ({
		value: item.id,
		label: `${item.name} (${item.sku})`,
	}));

	// Get currently linked items for this supplier
	const currentLinkedIds = (inventoryData || [])
		.filter((item) => item.supplierId === supplier?.id)
		.map((item) => item.id);

	useEffect(() => {
		if (open && supplier) {
			form.reset({
				name: supplier.name,
				phone: supplier.phone || "",
				email: supplier.email || "",
				address: supplier.address || "",
				notes: supplier.notes || "",
				inventoryItemIds: currentLinkedIds,
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, supplier]);

	useEffect(() => {
		if (!open) form.reset();
	}, [open, form]);

	const onSubmit = (data: UpdateSupplierInput) => {
		onSave(data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[580px]">
				<DialogHeader>
					<DialogTitle className="text-brand-main-800">Edit Supplier</DialogTitle>
					<DialogDescription className="text-brand-main-600">
						Update supplier details and manage linked inventory items.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Supplier Name *</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isUpdating}
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value || ""}
												disabled={isUpdating}
												className="focus:border-brand-main-400"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value || ""}
												type="email"
												disabled={isUpdating}
												className="focus:border-brand-main-400"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											disabled={isUpdating}
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
											disabled={isUpdating}
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{itemOptions.length > 0 && (
							<FormField
								control={form.control}
								name="inventoryItemIds"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Linked Inventory Items</FormLabel>
										<FormControl>
											<MultiSelect
												options={itemOptions}
												value={field.value || []}
												onChange={field.onChange}
												placeholder="Select items..."
												disabled={isUpdating}
											/>
										</FormControl>
										<p className="text-xs text-slate-500">
											Unselecting an item will remove its supplier link.
										</p>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								disabled={isUpdating}
								onClick={() => onOpenChange(false)}
								className="text-brand-main-700 hover:bg-brand-main-50 flex-1">
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isUpdating}
								className="bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1">
								{isUpdating ? <Spinner /> : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
