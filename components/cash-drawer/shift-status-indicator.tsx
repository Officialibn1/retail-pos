"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { OpenShiftDialog } from "./open-shift-dialog";
import { CloseShiftDialog } from "./close-shift-dialog";
import { useGetActiveSessionQuery } from "@/lib/store/api";
import { useAuth } from "@/components/auth/auth-provider";
import { Banknote, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShiftStatusIndicator() {
	const { user } = useAuth();
	const [openDialogVisible, setOpenDialogVisible] = useState(false);
	const [closeDialogVisible, setCloseDialogVisible] = useState(false);

	const { data, isLoading, refetch } = useGetActiveSessionQuery(undefined, {
		// Poll every 60 seconds to keep the indicator fresh
		pollingInterval: 60000,
	});

	// Only cashiers, admins, managers see this indicator
	if (!user) return null;

	const session = data?.session ?? null;
	const isOpen = session !== null;

	if (isLoading) return null;

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							isOpen ? setCloseDialogVisible(true) : setOpenDialogVisible(true)
						}
						className={cn(
							"flex items-center gap-1.5 text-xs h-8 px-2.5",
							isOpen
								? "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
								: "text-amber-700 hover:bg-amber-50 hover:text-amber-800",
						)}
					>
						<Banknote className="h-3.5 w-3.5" />
						<Badge
							variant="outline"
							className={cn(
								"text-[10px] px-1.5 py-0 h-4 font-medium border",
								isOpen
									? "border-emerald-300 text-emerald-700 bg-emerald-50"
									: "border-amber-300 text-amber-700 bg-amber-50",
							)}
						>
							{isOpen ? "Shift Open" : "No Shift"}
						</Badge>
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					{isOpen
						? `Shift started at ${new Date(session.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — click to close`
						: "No shift open — click to open a shift"}
				</TooltipContent>
			</Tooltip>

			<OpenShiftDialog
				open={openDialogVisible}
				onOpenChange={setOpenDialogVisible}
				onSuccess={refetch}
			/>

			{session && (
				<CloseShiftDialog
					open={closeDialogVisible}
					onOpenChange={setCloseDialogVisible}
					session={session}
					onSuccess={refetch}
				/>
			)}
		</>
	);
}
