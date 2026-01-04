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
	createCustomerSchema,
	type CreateCustomerInput,
} from "@/lib/validations/customer.schema";

interface AddCustomerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreateCustomerInput) => void;
	isCreating: boolean;
}

export function AddCustomerDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: AddCustomerDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateCustomerInput>({
		resolver: zodResolver(createCustomerSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

	const onSubmit = (data: CreateCustomerInput) => {
		// Convert empty strings to null for optional fields
		const cleanedData = {
			name: data.name?.trim() || null,
			email: data.email?.trim() || null,
			phone: data.phone?.trim() || null,
		};
		onSave(cleanedData);
	};

	// Handle cancel - ensures data is preserved (Requirement 6.3)
	const handleCancel = () => {
		reset(); // Reset form to initial state
		onOpenChange(false); // Close dialog without saving
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Add New Customer
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Create a new customer record. At least one field must be provided.
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
							disabled={isCreating}
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
							disabled={isCreating}
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
							disabled={isCreating}
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
							disabled={isCreating}
							variant='outline'
							onClick={handleCancel}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isCreating}
							className='bg-brand-main-600 hover:bg-brand-main-700 text-white flex-1'>
							{isCreating ? <Spinner /> : "Add Customer"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
