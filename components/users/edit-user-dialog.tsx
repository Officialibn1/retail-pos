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
	updateUserSchema,
	type UpdateUserInput,
} from "@/lib/validations/user.schema";
import { UserRole, Shift } from "@/generated/prisma/client";
import { UserWithoutPassword } from "@/lib/prisma-extended-types";

interface EditUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserWithoutPassword | null;
	onSave: (data: UpdateUserInput) => void;
	isUpdating: boolean;
}

export function EditUserDialog({
	open,
	onOpenChange,
	user,
	onSave,
	isUpdating,
}: EditUserDialogProps) {
	const form = useForm<UpdateUserInput>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			email: "",
			username: "",
			name: "",
			roles: [UserRole.CASHIER],
			shift: Shift.MORNING,
		},
	});

	// Pre-fill form with current user data when dialog opens
	useEffect(() => {
		if (open && user) {
			form.reset({
				email: user.email,
				username: user.username,
				name: user.name,
				roles: user.roles,
				shift: user.shift,
			});
		}
	}, [open, user, form]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: UpdateUserInput) => {
		onSave(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>Edit User</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Update user information and permissions.
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
										Full Name
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isUpdating}
											className='border-brand-main-200 focus:border-brand-main-400'
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
										Username
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isUpdating}
											className='border-brand-main-200 focus:border-brand-main-400'
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
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											type='email'
											disabled={isUpdating}
											className='border-brand-main-200 focus:border-brand-main-400'
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
										<FormLabel className='text-brand-main-700'>Role</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange([value as UserRole])
											}
											value={field.value?.[0]}
											disabled={isUpdating}>
											<FormControl>
												<SelectTrigger className='border-brand-main-200 focus:border-brand-main-400'>
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
										<FormLabel className='text-brand-main-700'>Shift</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
											disabled={isUpdating}>
											<FormControl>
												<SelectTrigger className='border-brand-main-200 focus:border-brand-main-400'>
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
								disabled={isUpdating}
								variant='outline'
								onClick={() => onOpenChange(false)}
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
				</Form>
			</DialogContent>
		</Dialog>
	);
}
