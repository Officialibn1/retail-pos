"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { closeShiftSchema, CloseShiftInput } from "@/lib/validations/cash-drawer.schema";
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
import { Badge } from "@/components/ui/badge";
import { useCloseShiftMutation } from "@/lib/store/api";
import { useToast } from "@/components/ui/use-toast";
import { CashDrawerSession } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";
import { Clock, Banknote } from "lucide-react";

interface CloseShiftDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: CashDrawerSession;
	onSuccess?: () => void;
}

export function CloseShiftDialog({
	open,
	onOpenChange,
	session,
	onSuccess,
}: CloseShiftDialogProps) {
	const { toast } = useToast();
	const [closeShift, { isLoading }] = useCloseShiftMutation();

	const form = useForm<CloseShiftInput>({
		resolver: zodResolver(closeShiftSchema),
		defaultValues: {
			declaredClose: 0,
			notes: session.notes ?? "",
		},
	});

	const declaredClose = form.watch("declaredClose");

	const openedAt = new Date(session.openedAt);
	const shiftDuration = Math.floor(
		(Date.now() - openedAt.getTime()) / (1000 * 60),
	);
	const hours = Math.floor(shiftDuration / 60);
	const minutes = shiftDuration % 60;
	const durationLabel =
		hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

	const onSubmit = async (values: CloseShiftInput) => {
		try {
			const result = await closeShift({ id: session.id, data: values }).unwrap();
			const variance = Number(result.session.variance ?? 0);
			const varianceLabel =
				variance === 0
					? "No variance — drawer balanced."
					: variance > 0
						? `Surplus of ${formatNaira(Math.abs(variance))}.`
						: `Shortage of ${formatNaira(Math.abs(variance))}.`;

			toast({
				title: "Shift closed",
				description: varianceLabel,
			});
			form.reset();
			onOpenChange(false);
			onSuccess?.();
		} catch (error: any) {
			const message =
				error?.data?.error?.message || "Failed to close shift. Please try again.";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle className="text-brand-main-800 flex items-center gap-2">
						<Banknote className="h-5 w-5 text-brand-main-600" />
						Close Shift
					</DialogTitle>
					<DialogDescription className="text-brand-main-600">
						Count the cash in the drawer and enter the total to reconcile your shift.
					</DialogDescription>
				</DialogHeader>

				{/* Shift summary */}
				<div className="bg-brand-main-50 rounded-lg border border-brand-main-100 p-4 space-y-2">
					<div className="flex justify-between items-center text-sm">
						<span className="text-brand-main-600">Opening float</span>
						<span className="font-medium text-brand-main-800">
							{formatNaira(Number(session.openingFloat))}
						</span>
					</div>
					<div className="flex justify-between items-center text-sm">
						<span className="text-brand-main-600 flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							Shift duration
						</span>
						<span className="font-medium text-brand-main-800">{durationLabel}</span>
					</div>
					<div className="flex justify-between items-center text-sm">
						<span className="text-brand-main-600">Started</span>
						<span className="font-medium text-brand-main-800">
							{openedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
						</span>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="declaredClose"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-brand-main-700">
										Cash in Drawer (₦)
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

						{/* Live variance preview */}
						{declaredClose > 0 && (
							<div className="flex items-center justify-between text-sm bg-muted rounded-md px-3 py-2">
								<span className="text-brand-main-600">Estimated variance</span>
								<Badge
									variant={declaredClose >= Number(session.openingFloat) ? "outline" : "destructive"}
									className="text-xs"
								>
									{declaredClose > Number(session.openingFloat)
										? `+${formatNaira(declaredClose - Number(session.openingFloat))}`
										: declaredClose === Number(session.openingFloat)
											? "Balanced"
											: `-${formatNaira(Number(session.openingFloat) - declaredClose)}`}
								</Badge>
							</div>
						)}

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
											placeholder="Any notes for closing this shift..."
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
								{isLoading ? "Closing..." : "Close Shift"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
