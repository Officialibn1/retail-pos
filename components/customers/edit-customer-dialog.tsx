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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
	updateCustomerSchema,
	type UpdateCustomerInput,
} from "@/lib/validations/customer.schema";
import { type CustomerWithSales } from "@/lib/store/api";

interface EditCustomerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customer: CustomerWithSales | null;
	onSave: (data: UpdateCustomerInput) => void;
	isUpdating: boolean;
}

export function EditCustomerDialog({
	open,
	onOpenChange,
	customer,
	onSave,
	isUpdating,
}: EditCustomerDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<UpdateCustomerInput>({
		resolver: zodResolver(updateCustomerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	// Pre-fill form with current customer data when dialog opens
	useEffect(() => {
		if (open && customer) {
			reset({
				name: customer.name || "",
				email: customer.email || "",
				phone: customer.phone || "",
			});
		}
	}, [open, customer, reset]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	const onSubmit = (data: UpdateCustomerInput) => {
		// Convert empty strings to null for optional fields
		const cleanedData = {
			name: data.name?.trim() || null,
			email: data.email?.trim() || null,
			phone: data.phone?.trim() || null,
		};
		onSave(cleanedData);
	};

	// Handle cancel - ensures data is preserved (Requirements 7.5, 8.5)
	const handleCancel = () => {
		// Reset form to original customer data
		if (customer) {
			reset({
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

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label
							htmlFor='name'
							className='text-brand-main-700'>
							Customer Name
						</Label>
						<Input
							id='name'
							{...register("name")}
							disabled={isUpdating}
							className='border-brand-main-200 focus:border-brand-main-400'
							placeholder='e.g., John Doe'
							aria-invalid={errors.name ? "true" : "false"}
							aria-describedby={errors.name ? "name-error" : undefined}
						/>
						{errors.name && (
							<p
								id='name-error'
								className='text-sm text-red-600'
								role='alert'>
								{errors.name.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='email'
							className='text-brand-main-700'>
							Email Address
						</Label>
						<Input
							id='email'
							type='email'
							{...register("email")}
							disabled={isUpdating}
							className='border-brand-main-200 focus:border-brand-main-400'
							placeholder='e.g., john@example.com'
							aria-invalid={errors.email ? "true" : "false"}
							aria-describedby={errors.email ? "email-error" : undefined}
						/>
						{errors.email && (
							<p
								id='email-error'
								className='text-sm text-red-600'
								role='alert'>
								{errors.email.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label
							htmlFor='phone'
							className='text-brand-main-700'>
							Phone Number
						</Label>
						<Input
							id='phone'
							type='tel'
							{...register("phone")}
							disabled={isUpdating}
							className='border-brand-main-200 focus:border-brand-main-400'
							placeholder='e.g., +2348012345678'
							aria-invalid={errors.phone ? "true" : "false"}
							aria-describedby={errors.phone ? "phone-error" : undefined}
						/>
						{errors.phone && (
							<p
								id='phone-error'
								className='text-sm text-red-600'
								role='alert'>
								{errors.phone.message}
							</p>
						)}
					</div>

					{errors.root && (
						<p
							className='text-sm text-red-600'
							role='alert'>
							{errors.root.message}
						</p>
					)}

					<DialogFooter>
						<Button
							type='button'
							disabled={isUpdating}
							variant='outline'
							onClick={handleCancel}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isUpdating}
							className='bg-brand-main-600 hover:bg-brand-main-700 text-white flex-1'>
							{isUpdating ? <Spinner /> : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
