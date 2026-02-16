"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import {
	changePasswordSchema,
	type ChangePasswordInput,
} from "@/lib/validations/change-password.schema";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function ChangePasswordDialog({
	open,
	onOpenChange,
	onSuccess,
}: ChangePasswordDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<ChangePasswordInput>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: ChangePasswordInput) => {
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/change-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error?.message || "Failed to change password");
			}

			toast.success("Password Changed", {
				description: result.message,
			});

			form.reset();
			onOpenChange(false);
			onSuccess();
		} catch (error) {
			toast.error("Error", {
				description:
					error instanceof Error ? error.message : "Failed to change password",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Change Password
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Enter your current password and choose a new password.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className='space-y-4'>
						<FormField
							control={form.control}
							name='currentPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Current Password *
									</FormLabel>
									<FormControl>
										<div className='relative'>
											<Input
												{...field}
												type={showCurrentPassword ? "text" : "password"}
												placeholder='Enter your current password'
												className='border-brand-main-200 focus:border-brand-main-400 pr-10'
												disabled={isLoading}
											/>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
												onClick={() =>
													setShowCurrentPassword(!showCurrentPassword)
												}
												disabled={isLoading}>
												{showCurrentPassword ? (
													<EyeOff className='h-4 w-4 text-brand-main-500' />
												) : (
													<Eye className='h-4 w-4 text-brand-main-500' />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='newPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										New Password *
									</FormLabel>
									<FormControl>
										<div className='relative'>
											<Input
												{...field}
												type={showNewPassword ? "text" : "password"}
												placeholder='Enter your new password'
												className='border-brand-main-200 focus:border-brand-main-400 pr-10'
												disabled={isLoading}
											/>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
												onClick={() => setShowNewPassword(!showNewPassword)}
												disabled={isLoading}>
												{showNewPassword ? (
													<EyeOff className='h-4 w-4 text-brand-main-500' />
												) : (
													<Eye className='h-4 w-4 text-brand-main-500' />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='confirmPassword'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-brand-main-700'>
										Confirm New Password *
									</FormLabel>
									<FormControl>
										<div className='relative'>
											<Input
												{...field}
												type={showConfirmPassword ? "text" : "password"}
												placeholder='Confirm your new password'
												className='border-brand-main-200 focus:border-brand-main-400 pr-10'
												disabled={isLoading}
											/>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												disabled={isLoading}>
												{showConfirmPassword ? (
													<EyeOff className='h-4 w-4 text-brand-main-500' />
												) : (
													<Eye className='h-4 w-4 text-brand-main-500' />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className='gap-2'>
							<Button
								type='button'
								variant='outline'
								onClick={handleCancel}
								disabled={isLoading}
								className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50'>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isLoading}
								className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
								{isLoading && <Spinner className='mr-2 h-4 w-4' />}
								Change Password
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
