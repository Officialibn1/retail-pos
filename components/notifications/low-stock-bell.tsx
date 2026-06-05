"use client";

import Link from "next/link";
import { Bell, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetLowStockNotificationsQuery } from "@/lib/store/api";
import { useAuth } from "@/components/auth/auth-provider";
import { canManageInventory } from "@/lib/auth";

export function LowStockBell() {
	const { user } = useAuth();

	// Only MANAGER+ sees stock alerts
	const isManager = user ? canManageInventory(user.roles) : false;

	const { data, isLoading } = useGetLowStockNotificationsQuery(undefined, {
		skip: !isManager,
		pollingInterval: 120000, // re-poll every 2 minutes
	});

	const count = data?.count ?? 0;
	const items = data?.items ?? [];
	const outOfStock = items.filter((i) => i.stock === 0);
	const lowStock = items.filter((i) => i.stock > 0);

	if (!isManager) {
		// Non-managers still see the bell but without alerts
		return (
			<Button
				variant="ghost"
				size="icon"
				className="text-brand-main-600 hover:bg-brand-main-100 relative">
				<Bell className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Popover>
			<PopoverTrigger>
				<Button
					variant="ghost"
					size="icon"
					className="text-brand-main-600 hover:bg-brand-main-100 relative">
					<Bell className="h-4 w-4" />
					{!isLoading && count > 0 && (
						<Badge
							className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 hover:bg-red-500 text-white border-0 rounded-full">
							{count > 99 ? "99+" : count}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-80 p-0">
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<Bell className="h-4 w-4 text-brand-main-600" />
						<span className="font-semibold text-sm text-brand-main-800">
							Notifications
						</span>
					</div>
					{count > 0 && (
						<Badge variant="destructive" className="text-xs">
							{count} alert{count !== 1 ? "s" : ""}
						</Badge>
					)}
				</div>

				{count === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center px-4">
						<Package className="h-8 w-8 text-brand-main-300 mb-2" />
						<p className="text-sm text-brand-main-500">All stock levels are healthy</p>
					</div>
				) : (
					<>
						<ScrollArea className="max-h-72">
							{outOfStock.length > 0 && (
								<div>
									<div className="px-4 py-2 bg-red-50 border-b">
										<p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
											Out of Stock ({outOfStock.length})
										</p>
									</div>
									{outOfStock.map((item) => (
										<div
											key={item.id}
											className="px-4 py-2.5 border-b last:border-0 flex items-start gap-3 hover:bg-muted/50">
											<AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
											<div className="min-w-0">
												<p className="text-sm font-medium text-brand-main-800 truncate">
													{item.name}
												</p>
												<p className="text-xs text-brand-main-500">
													{item.category} · SKU: {item.sku}
												</p>
												<p className="text-xs text-red-600 font-medium">
													0 units remaining
												</p>
											</div>
										</div>
									))}
								</div>
							)}

							{lowStock.length > 0 && (
								<div>
									<div className="px-4 py-2 bg-amber-50 border-b">
										<p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
											Low Stock ({lowStock.length})
										</p>
									</div>
									{lowStock.map((item) => (
										<div
											key={item.id}
											className="px-4 py-2.5 border-b last:border-0 flex items-start gap-3 hover:bg-muted/50">
											<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
											<div className="min-w-0">
												<p className="text-sm font-medium text-brand-main-800 truncate">
													{item.name}
												</p>
												<p className="text-xs text-brand-main-500">
													{item.category} · SKU: {item.sku}
												</p>
												<p className="text-xs text-amber-600 font-medium">
													{item.stock} unit{item.stock !== 1 ? "s" : ""} left
													<span className="text-brand-main-400 font-normal">
														{" "}(reorder at ≤{item.reorderLevel})
													</span>
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</ScrollArea>

						<Separator />
						<div className="p-2">
							<Button
								variant="ghost"
								size="sm"
								className="w-full text-brand-main-700 hover:bg-brand-main-50 text-xs"
								asChild>
								<Link href="/dashboard/inventory">
									View Inventory
								</Link>
							</Button>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}
