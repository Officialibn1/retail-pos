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
	updateCategorySchema,
	type UpdateCategoryInput,
} from "@/lib/validations/category.schema";
import { type CategoryWithCount } from "@/lib/prisma-extended-types";

interface EditCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category: CategoryWithCount | null;
	onSave: (data: UpdateCategoryInput) => void;
	isUpdating: boolean;
}

export function EditCategoryDialog({
	open,
	onOpenChange,
	category,
	onSave,
	isUpdating,
}: EditCategoryDialogProps) {
	const form = useForm<UpdateCategoryInput>({
		resolver: zodResolver(updateCategorySchema),
		defaultValues: {
			name: "",
		},
	});

	// Pre-fill form with current category data when dialog opens
	useEffect(() => {
		if (open && category) {
			form.reset({
				name: category.name,
			});
		}
	}, [open, category, form]);

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: UpdateCategoryInput) => {
		onSave(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Edit Category
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Update the category information below.
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
										Category Name *
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isUpdating}
											className='  focus:border-brand-main-400'
											placeholder='e.g., Electronics, Clothing, Food'
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
								onClick={() => onOpenChange(false)}
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
