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
	createCategorySchema,
	type CreateCategoryInput,
} from "@/lib/validations/category.schema";

interface AddCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreateCategoryInput) => void;
	isCreating: boolean;
}

export function AddCategoryDialog({
	open,
	onOpenChange,
	onSave,
	isCreating,
}: AddCategoryDialogProps) {
	const form = useForm<CreateCategoryInput>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
		},
	});

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			form.reset();
		}
	}, [open, form]);

	const onSubmit = (data: CreateCategoryInput) => {
		onSave(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle className='text-brand-main-800'>
						Add New Category
					</DialogTitle>
					<DialogDescription className='text-brand-main-600'>
						Create a new category to organize your inventory items.
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
											disabled={isCreating}
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
								{isCreating ? <Spinner /> : "Add Category"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
