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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	createUserSchema,
	type CreateUserInput,
} from "@/lib/validations/user.schema";
import { UserRole, Shift } from "@/generated/prisma/client";

interface AddUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreateUserInput) => void;
	isCreating: boolean;
}

export function AddUserDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: AddUserDialogProps) {
	const form = useForm<CreateUserInput>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			email: "",
			username: "",
			name: "",
			roles: [UserRole.CASHIER],
			shift: Shift.MORNING,
		},
	});

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: CreateUserInput) => {
		onSave(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Add New User
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Create a new user account for the store.
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
										Full Name *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isCreating}
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
							name='username'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Username *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isCreating}
											className='  focus:border-brand-main-400'
											placeholder='e.g., johndoe'
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
										Email Address *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
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

						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='roles'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Role *
										</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange([value as UserRole])
											}
											defaultValue={field.value?.[0]}
											disabled={isCreating}>
											<FormControl>
												<SelectTrigger className='  focus:border-brand-main-400 w-full'>
													<SelectValue placeholder='Select role' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={UserRole.CASHIER}>
													Cashier
												</SelectItem>
												<SelectItem value={UserRole.MANAGER}>
													Manager
												</SelectItem>
												<SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
												<SelectItem value={Shift.FULLTIME}>
													Full Time
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='shift'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-brand-main-700'>
											Shift *
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											disabled={isCreating}>
											<FormControl>
												<SelectTrigger className='  focus:border-brand-main-400 w-full'>
													<SelectValue placeholder='Select shift' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={Shift.MORNING}>Morning</SelectItem>
												<SelectItem value={Shift.EVENING}>Evening</SelectItem>
												<SelectItem value={Shift.FULLTIME}>
													Full Time
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type='button'
								disabled={isCreating}
								variant='outline'
								onClick={() => onOpenChange(false)}
								className='  text-brand-main-700 hover:bg-brand-main-50 flex-1'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isCreating}
								className='bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1'>
								{isCreating ? <Spinner /> : "Add User"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
