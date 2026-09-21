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
	createCustomerUISchema,
	customerSchema,
	type CustomerInput,
} from "@/lib/validations/customer.schema";

interface AddCustomerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CustomerInput) => void;
	isCreating: boolean;
}

export function AddCustomerDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: AddCustomerDialogProps) {
	const form = useForm<CustomerInput>({
		resolver: zodResolver(createCustomerUISchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
		},
	});

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

	// Handle cancel - ensures data is preserved (Requirement 6.3)
	const handleCancel = () => {
		form.reset(); // Reset form to initial state
		onOpenChange(false); // Close dialog without saving
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-950'>
						Add New Customer
					</DialogTitle>
					<DialogDescription className='text-slate-600'>
						Create a new customer record. Phone number is required.
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
									<FormLabel>
										Customer Name <span className='text-red-500'>*</span>
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											disabled={isCreating}
											className='focus:border-brand-main-400'
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
									<FormLabel>
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											type='email'
											disabled={isCreating}
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
									<FormLabel>
										Phone Number *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											value={field.value || ""}
											type='tel'
											disabled={isCreating}
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
								disabled={isCreating}
								variant='outline'
								onClick={handleCancel}
								className='hover:bg-brand-main-50 flex-1'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isCreating}
								className='bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1'>
								{isCreating ? <Spinner /> : "Add Customer"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
