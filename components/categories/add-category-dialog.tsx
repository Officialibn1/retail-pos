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
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateCategoryInput>({
		resolver: zodResolver(createCategorySchema),
		defaultValues: {
			name: "",
		},
	});

	// Reset form when dialog closes
	useEffect(() => {
		if (!open) {
			reset();
		}
	}, [open, reset]);

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

				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'>
					<div className='space-y-2'>
						<Label
							htmlFor='name'
							className='text-brand-main-700'>
							Category Name *
						</Label>
						<Input
							id='name'
							{...register("name")}
							disabled={isCreating}
							className='border-brand-main-200 focus:border-brand-main-400'
							placeholder='e.g., Electronics, Clothing, Food'
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

					<DialogFooter>
						<Button
							type='button'
							disabled={isCreating}
							variant='outline'
							onClick={() => onOpenChange(false)}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 flex-1'>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={isCreating}
							className='bg-brand-main-600 hover:bg-brand-main-700 text-white flex-1'>
							{isCreating ? <Spinner /> : "Add Category"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
