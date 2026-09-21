"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, MapPin, Package, Phone, ShoppingBag, StickyNote, Truck } from "lucide-react";
import { useGetSupplierDetailQuery } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
	PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-200",
	ORDERED:   "bg-blue-100 text-blue-800 border-blue-200",
	RECEIVED:  "bg-green-100 text-green-800 border-green-200",
	CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

interface SupplierDetailDialogProps {
	supplierId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SupplierDetailDialog({
	supplierId,
	open,
	onOpenChange,
}: SupplierDetailDialogProps) {
	const c = useCurrencySymbol();

	const { data, isLoading } = useGetSupplierDetailQuery(supplierId!, {
		skip: !supplierId || !open,
	});

	const supplier = data?.supplier;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-brand-main-800 flex items-center gap-2">
						<Truck className="h-5 w-5" />
						Supplier Details
					</DialogTitle>
				</DialogHeader>

				{isLoading || !supplier ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="h-6 w-6 animate-spin text-brand-main-600" />
					</div>
				) : (
					<div className="space-y-4">
						{/* Info block */}
						<div className="rounded-md border bg-slate-50 p-4 space-y-2">
							<p className="text-lg font-semibold text-brand-main-900">
								{supplier.name}
							</p>
							<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
								{supplier.phone && (
									<span className="flex items-center gap-1.5">
										<Phone className="h-3.5 w-3.5" /> {supplier.phone}
									</span>
								)}
								{supplier.email && (
									<span className="flex items-center gap-1.5">
										<Mail className="h-3.5 w-3.5" /> {supplier.email}
									</span>
								)}
								{supplier.address && (
									<span className="flex items-center gap-1.5">
										<MapPin className="h-3.5 w-3.5" /> {supplier.address}
									</span>
								)}
							</div>
							{supplier.notes && (
								<p className="flex items-start gap-1.5 text-sm text-slate-500">
									<StickyNote className="h-3.5 w-3.5 mt-0.5 shrink-0" />
									{supplier.notes}
								</p>
							)}
							<div className="flex gap-3 pt-1">
								<Badge variant="outline" className="text-xs gap-1">
									<Package className="h-3 w-3" />
									{supplier._count.inventoryItems} item{supplier._count.inventoryItems !== 1 ? "s" : ""}
								</Badge>
								<Badge variant="outline" className="text-xs gap-1">
									<ShoppingBag className="h-3 w-3" />
									{supplier._count.purchaseOrders} order{supplier._count.purchaseOrders !== 1 ? "s" : ""}
								</Badge>
							</div>
						</div>

						<Separator />

						<Tabs defaultValue="items">
							<TabsList className="w-full">
								<TabsTrigger value="items" className="flex-1">
									Inventory Items ({supplier.inventoryItems.length})
								</TabsTrigger>
								<TabsTrigger value="orders" className="flex-1">
									Purchase Orders ({supplier.purchaseOrders.length})
								</TabsTrigger>
							</TabsList>

							{/* ── Inventory Items ── */}
							<TabsContent value="items">
								{supplier.inventoryItems.length === 0 ? (
									<p className="text-center text-sm text-slate-500 py-8">
										No inventory items linked to this supplier.
									</p>
								) : (
									<div className="divide-y border rounded-md overflow-hidden mt-3">
										<div className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 px-3 py-2 bg-slate-50 text-xs font-medium text-slate-500">
											<span>Product</span>
											<span>SKU</span>
											<span className="text-right">Cost</span>
											<span className="text-right">Price</span>
											<span className="text-right">Stock</span>
										</div>
										{supplier.inventoryItems.map((item) => (
											<div
												key={item.id}
												className="grid grid-cols-[1fr_80px_80px_80px_80px] gap-2 px-3 py-2 text-sm items-center">
												<div>
													<p className="font-medium text-slate-800 truncate">
														{item.name}
													</p>
													<p className="text-xs text-slate-400">
														{item.category.name}
													</p>
												</div>
												<p className="text-xs text-slate-500 font-mono">
													{item.sku}
												</p>
												<p className="text-right text-slate-600">
													{item.cost != null
														? formatNaira(Number(item.cost), c)
														: <span className="text-slate-400">—</span>}
												</p>
												<p className="text-right text-slate-700">
													{formatNaira(Number(item.price), c)}
												</p>
												<p className="text-right font-medium text-slate-800">
													{item.stock}
												</p>
											</div>
										))}
									</div>
								)}
							</TabsContent>

							{/* ── Purchase Orders ── */}
							<TabsContent value="orders">
								{supplier.purchaseOrders.length === 0 ? (
									<p className="text-center text-sm text-slate-500 py-8">
										No purchase orders for this supplier yet.
									</p>
								) : (
									<div className="space-y-3 mt-3">
										{supplier.purchaseOrders.map((order) => (
											<div
												key={order.id}
												className="border rounded-md p-3 space-y-2">
												<div className="flex items-center justify-between flex-wrap gap-2">
													<div className="flex items-center gap-2">
														<Badge
															className={`${STATUS_COLORS[order.status]} border text-xs`}>
															{order.status}
														</Badge>
														<span className="text-sm font-medium text-brand-main-800">
															{formatNaira(Number(order.totalCost), c)}
														</span>
													</div>
													<span className="text-xs text-slate-500">
														{format(new Date(order.createdAt), "dd MMM yyyy")}
														{order.receivedAt && (
															<span className="text-green-600 ml-2">
																· Received {format(new Date(order.receivedAt), "dd MMM yyyy")}
															</span>
														)}
													</span>
												</div>
												<div className="divide-y border rounded text-xs overflow-hidden">
													<div className="grid grid-cols-[1fr_60px_80px] gap-2 px-2 py-1.5 bg-slate-50 font-medium text-slate-500">
														<span>Item</span>
														<span className="text-right">Qty</span>
														<span className="text-right">Unit Cost</span>
													</div>
													{order.items.map((li) => (
														<div
															key={li.id}
															className="grid grid-cols-[1fr_60px_80px] gap-2 px-2 py-1.5 items-center">
															<span className="text-slate-700">
																{li.inventoryItem.name}
																<span className="text-slate-400 ml-1">
																	({li.inventoryItem.sku})
																</span>
															</span>
															<span className="text-right text-slate-600">
																{li.quantity}
															</span>
															<span className="text-right text-slate-600">
																{formatNaira(Number(li.unitCost), c)}
															</span>
														</div>
													))}
												</div>
												{order.notes && (
													<p className="text-xs text-slate-400 pt-1">
														{order.notes}
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</TabsContent>
						</Tabs>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
