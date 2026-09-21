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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	createExpenseSchema,
	type CreateExpenseInput,
	EXPENSE_CATEGORIES,
	EXPENSE_CATEGORY_LABELS,
} from "@/lib/validations/expense.schema";

interface AddExpenseDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (data: CreateExpenseInput, form: any) => void;
	isSaving: boolean;
}

export function AddExpenseDialog({
	open,
	onOpenChange,
	onSave,
	isSaving,
}: AddExpenseDialogProps) {
	const form = useForm<CreateExpenseInput>({
		resolver: zodResolver(createExpenseSchema),
		defaultValues: {
			title: "",
			amount: 0,
			category: undefined,
			description: "",
			date: new Date().toISOString(),
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset({
				title: "",
				amount: 0,
				category: undefined,
				description: "",
				date: new Date().toISOString(),
			});
		}
	}, [open, form]);

	const onSubmit = (data: CreateExpenseInput) => {
		onSave(data, form);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="text-brand-main-950">
						Record Expense
					</DialogTitle>
					<DialogDescription className="text-brand-main-800">
						Log a new operational expense for the store.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title *</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="e.g. Monthly rent payment"
											disabled={isSaving}
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Amount *</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												step="0.01"
												min={0}
												disabled={isSaving}
												className="focus:border-brand-main-400"
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : "",
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category *</FormLabel>
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={isSaving}
										>
											<FormControl>
												<SelectTrigger className="focus:border-brand-main-400 w-full">
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{EXPENSE_CATEGORIES.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{EXPENSE_CATEGORY_LABELS[cat]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date *</FormLabel>
									<FormControl>
										<Input
											type="date"
											disabled={isSaving}
											value={
												field.value
													? new Date(field.value).toISOString().split("T")[0]
													: ""
											}
											onChange={(e) => {
												const d = e.target.value
													? new Date(e.target.value).toISOString()
													: new Date().toISOString();
												field.onChange(d);
											}}
											className="focus:border-brand-main-400"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											value={field.value ?? ""}
											disabled={isSaving}
											placeholder="Optional notes about this expense…"
											className="focus:border-brand-main-400"
											rows={3}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								disabled={isSaving}
								onClick={() => onOpenChange(false)}
								className="hover:bg-brand-main-50 flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving}
								className="bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1"
							>
								{isSaving ? <Spinner /> : "Save Expense"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
