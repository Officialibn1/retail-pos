"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { openShiftSchema, OpenShiftInput } from "@/lib/validations/cash-drawer.schema";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useOpenShiftMutation } from "@/lib/store/api";
import { useToast } from "@/components/ui/use-toast";
import { Banknote } from "lucide-react";

interface OpenShiftDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function OpenShiftDialog({
	open,
	onOpenChange,
	onSuccess,
}: OpenShiftDialogProps) {
	const { toast } = useToast();
	const [openShift, { isLoading }] = useOpenShiftMutation();

	const form = useForm<OpenShiftInput>({
		resolver: zodResolver(openShiftSchema),
		defaultValues: {
			openingFloat: 0,
			notes: "",
		},
	});

	const onSubmit = async (values: OpenShiftInput) => {
		try {
			await openShift(values).unwrap();
			toast({
				title: "Shift opened",
				description: `Opening float of ₦${values.openingFloat.toLocaleString()} recorded.`,
			});
			form.reset();
			onOpenChange(false);
			onSuccess?.();
		} catch (error: any) {
			const message =
				error?.data?.error?.message || "Failed to open shift. Please try again.";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[440px]">
				<DialogHeader>
					<DialogTitle className="text-brand-main-800 flex items-center gap-2">
						<Banknote className="h-5 w-5 text-brand-main-600" />
						Open Shift
					</DialogTitle>
					<DialogDescription className="text-brand-main-600">
						Count the cash in the drawer and enter the opening float to begin your shift.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
						<FormField
							control={form.control}
							name="openingFloat"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-brand-main-700">
										Opening Float (₦)
									</FormLabel>
									<FormControl>
										<Input
											type="number"
											min={0}
											step={0.01}
											placeholder="0.00"
											className="border-brand-main-200 focus-visible:ring-brand-main-400"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-brand-main-700">
										Notes <span className="text-brand-main-400 font-normal">(optional)</span>
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any notes for this shift..."
											className="border-brand-main-200 focus-visible:ring-brand-main-400 resize-none"
											rows={3}
											{...field}
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
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
								className="text-brand-main-700 hover:bg-brand-main-50"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								className="bg-brand-main-900 hover:bg-brand-main-800 text-white"
							>
								{isLoading ? "Opening..." : "Open Shift"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
