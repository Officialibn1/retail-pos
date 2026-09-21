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
	createSupplierSchema,
	type CreateSupplierInput,
} from "@/lib/validations/supplier.schema";
import { useGetInventoryQuery } from "@/lib/store/api";
import { MultiSelect } from "@/components/ui/multi-select";

interface AddSupplierDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreateSupplierInput, form: any) => void;
	isCreating: boolean;
}

export function AddSupplierDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: AddSupplierDialogProps) {
	const form = useForm<CreateSupplierInput>({
		resolver: zodResolver(createSupplierSchema),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			address: "",
			notes: "",
			inventoryItemIds: [],
		},
	});

	// Only show items that have no supplier assigned yet
	const { data: inventoryData } = useGetInventoryQuery();
	const unassignedItems = (inventoryData || []).filter((item) => !item.supplierId);
	const itemOptions = unassignedItems.map((item) => ({
		value: item.id,
		label: `${item.name} (${item.sku})`,
	}));

	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: CreateSupplierInput) => {
		onSave(data, form);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[580px]">
				<DialogHeader>
					<DialogTitle className="text-brand-main-950">Add Supplier</DialogTitle>
					<DialogDescription className="text-brand-main-800">
						Add a new supplier and optionally link inventory items to them.
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
											disabled={isCreating}
											placeholder="e.g. Lagos Wholesale Ltd"
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
												disabled={isCreating}
												placeholder="+234 800 000 0000"
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
												disabled={isCreating}
												type="email"
												placeholder="supplier@example.com"
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
											disabled={isCreating}
											placeholder="Street, City, State"
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
											disabled={isCreating}
											rows={2}
											placeholder="Any extra details about this supplier..."
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
										<FormLabel>Link Inventory Items</FormLabel>
										<FormControl>
											<MultiSelect
												options={itemOptions}
												value={field.value || []}
												onChange={field.onChange}
												placeholder="Select items to assign to this supplier..."
												disabled={isCreating}
											/>
										</FormControl>
										<p className="text-xs text-slate-500">
											Only items without a supplier are shown.
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
								disabled={isCreating}
								onClick={() => onOpenChange(false)}
								className="hover:bg-brand-main-50 flex-1">
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isCreating}
								className="bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1">
								{isCreating ? <Spinner /> : "Add Supplier"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
