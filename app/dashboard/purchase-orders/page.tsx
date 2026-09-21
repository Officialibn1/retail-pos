"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	ShoppingBag,
	Clock,
	CheckCircle,
	XCircle,
	Loader2,
	Eye,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import { UserRole } from "@/lib/types";
import {
	useGetPurchaseOrdersQuery,
	useCreatePurchaseOrderMutation,
	useReceivePurchaseOrderMutation,
	useCancelPurchaseOrderMutation,
} from "@/lib/store/api";
import { PurchaseOrderWithDetails } from "@/lib/prisma-extended-types";
import { CreatePurchaseOrderInput } from "@/lib/validations/purchase-order.schema";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CreatePurchaseOrderDialog } from "@/components/purchase-orders/create-purchase-order-dialog";
import { PurchaseOrderDetailDialog } from "@/components/purchase-orders/purchase-order-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
	ORDERED: "bg-blue-100 text-blue-800 border-blue-200",
	RECEIVED: "bg-green-100 text-green-800 border-green-200",
	CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function PurchaseOrdersPage() {
	const { user } = useAuth();
	const c = useCurrencySymbol();
	const [statusFilter, setStatusFilter] = useState("all");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [selectedOrder, setSelectedOrder] =
		useState<PurchaseOrderWithDetails | null>(null);
	const [showDetailDialog, setShowDetailDialog] = useState(false);

	const {
		data: ordersData,
		isLoading,
		isError,
		error,
	} = useGetPurchaseOrdersQuery(
		statusFilter !== "all" ? { status: statusFilter } : undefined,
	);

	const [createPurchaseOrder, { isLoading: isCreating }] =
		useCreatePurchaseOrderMutation();
	const [receivePurchaseOrder, { isLoading: isReceiving }] =
		useReceivePurchaseOrderMutation();
	const [cancelPurchaseOrder, { isLoading: isCancelling }] =
		useCancelPurchaseOrderMutation();

	const orders = ordersData?.orders || [];

	const pendingCount = orders.filter(
		(o) => o.status === "PENDING" || o.status === "ORDERED",
	).length;
	const receivedCount = orders.filter((o) => o.status === "RECEIVED").length;
	const totalSpend = orders
		.filter((o) => o.status === "RECEIVED")
		.reduce((sum, o) => sum + Number(o.totalCost), 0);

	const handleCreateOrder = async (
		data: CreatePurchaseOrderInput,
		form: any,
	) => {
		try {
			await createPurchaseOrder(data).unwrap();
			form.reset();
			setShowCreateDialog(false);
			toast.success("Purchase order created");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to create purchase order");
		}
	};

	const handleReceive = async (id: string) => {
		try {
			await receivePurchaseOrder({ id, data: {} }).unwrap();
			setShowDetailDialog(false);
			setSelectedOrder(null);
			toast.success("Order marked as received — stock updated");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to receive order");
		}
	};

	const handleCancel = async (id: string) => {
		try {
			await cancelPurchaseOrder(id).unwrap();
			setShowDetailDialog(false);
			setSelectedOrder(null);
			toast.success("Purchase order cancelled");
		} catch (err: any) {
			toast.error(err.data?.error?.message || "Failed to cancel order");
		}
	};

	const openDetail = (order: PurchaseOrderWithDetails) => {
		setSelectedOrder(order);
		setShowDetailDialog(true);
	};

	if (!user) return null;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-brand-main-600" />
			</div>
		);
	}

	if (isError) {
		const msg =
			(error as any)?.data?.error?.message || "Failed to load purchase orders";
		return (
			<div className="space-y-6 p-6">
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-800">Error</CardTitle>
						<p className="text-red-700">{msg}</p>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
			<div className="space-y-6 p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-brand-main-950">
							Purchase Orders
						</h1>
						<p className="text-brand-main-800 mt-1">
							Track stock purchases from suppliers
						</p>
					</div>
					<Button
						onClick={() => setShowCreateDialog(true)}
						className="bg-brand-main-900 hover:bg-brand-main-700 text-white">
						<Plus className="h-4 w-4 mr-2" />
						New Order
					</Button>
				</div>

				{/* Summary cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Open Orders
							</CardTitle>
							<Clock className="h-4 w-4 text-yellow-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{pendingCount}
							</div>
							<p className="text-xs text-slate-500">Pending or ordered</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Received
							</CardTitle>
							<CheckCircle className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{receivedCount}
							</div>
							<p className="text-xs text-slate-500">Completed orders</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Total Spend (Received)
							</CardTitle>
							<ShoppingBag className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{formatNaira(totalSpend, c)}
							</div>
							<p className="text-xs text-slate-500">Cost of received orders</p>
						</CardContent>
					</Card>
				</div>

				{/* Orders list */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-4 mt-2">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-44 focus:border-brand-main-400">
									<SelectValue placeholder="All Statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="ORDERED">Ordered</SelectItem>
									<SelectItem value="RECEIVED">Received</SelectItem>
									<SelectItem value="CANCELLED">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						{orders.length === 0 ? (
							<div className="text-center py-12 text-slate-500">
								<ShoppingBag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
								<p className="text-lg font-medium">No purchase orders</p>
								<p className="text-sm">
									Create your first order to start tracking restocks.
								</p>
							</div>
						) : (
							<div className="divide-y">
								{orders.map((order) => (
									<div
										key={order.id}
										className="flex items-center justify-between py-4 gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-semibold text-brand-main-900">
													{order.supplier.name}
												</span>
												<Badge
													className={`${STATUS_COLORS[order.status]} border text-xs`}>
													{order.status}
												</Badge>
											</div>
											<div className="mt-1 text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
												<span>
													{order.items.length} item
													{order.items.length !== 1 ? "s" : ""}
												</span>
												<span className="font-medium text-brand-main-700">
													{formatNaira(Number(order.totalCost), c)}
												</span>
												<span>
													{format(new Date(order.createdAt), "dd MMM yyyy")}
												</span>
												{order.receivedAt && (
													<span className="text-green-600">
														Received{" "}
														{format(new Date(order.receivedAt), "dd MMM yyyy")}
													</span>
												)}
											</div>
											{order.notes && (
												<p className="text-xs text-slate-400 mt-1 truncate max-w-lg">
													{order.notes}
												</p>
											)}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openDetail(order)}
											className="text-brand-main-700 hover:bg-brand-main-50 shrink-0">
											<Eye className="h-4 w-4 mr-1" />
											View
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Dialogs */}
				<CreatePurchaseOrderDialog
					open={showCreateDialog}
					onOpenChange={setShowCreateDialog}
					onSave={handleCreateOrder}
					isCreating={isCreating}
				/>

				<PurchaseOrderDetailDialog
					open={showDetailDialog}
					onOpenChange={(v) => {
						setShowDetailDialog(v);
						if (!v) setSelectedOrder(null);
					}}
					order={selectedOrder}
					onReceive={handleReceive}
					onCancel={handleCancel}
					isReceiving={isReceiving}
					isCancelling={isCancelling}
				/>
			</div>
		</ProtectedRoute>
	);
}
