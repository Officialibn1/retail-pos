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
	customerSchema,
	type CustomerInput,
} from "@/lib/validations/customer.schema";
import { type CustomerWithSales } from "@/lib/services/customer.service";

interface EditCustomerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customer: CustomerWithSales | null;
	onSave: (data: CustomerInput) => void;
	isUpdating: boolean;
}

export function EditCustomerDialog({
	open,
	onOpenChange,
	customer,
	onSave,
	isUpdating,
}: EditCustomerDialogProps) {
	const form = useForm<CustomerInput>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	// Pre-fill form with current customer data when dialog opens
	useEffect(() => {
		if (open && customer) {
			form.reset({
				name: customer.name || "",
				email: customer.email || "",
				phone: customer.phone || "",
			});
		}
	}, [open, customer, form]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: CustomerInput) => {
		// Data is already cleaned by the schema transform
		onSave(data);
	};

	// Handle cancel - ensures data is preserved (Requirements 7.5, 8.5)
	const handleCancel = () => {
		// Reset form to original customer data
		if (customer) {
			form.reset({
				name: customer.name || "",
				email: customer.email || "",
				phone: customer.phone || "",
			});
		}
		onOpenChange(false); // Close dialog without saving
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Edit Customer
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Update the customer information below.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Customer Name
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											disabled={isUpdating}
											className='  focus:border-brand-main-400'
											placeholder='e.g., John Doe'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											type='email'
											disabled={isUpdating}
											className='  focus:border-brand-main-400'
											placeholder='e.g., john@example.com'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='phone'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Phone Number *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											type='tel'
											disabled={isUpdating}
											className='  focus:border-brand-main-400'
											placeholder='e.g., +2348012345678'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type='button'
								disabled={isUpdating}
								variant='outline'
								onClick={handleCancel}
								className='  text-brand-main-700 hover:bg-brand-main-50 flex-1'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isUpdating}
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
