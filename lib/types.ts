// Import Prisma namespace and enums
import {
	Prisma,
	UserRole,
	SaleStatus,
	Shift,
	PaymentMethod,
} from "@/generated/prisma/client";

// Re-export Prisma enums for convenience
export { UserRole, SaleStatus, Shift, PaymentMethod };

// Use Decimal from Prisma namespace
type Decimal = Prisma.Decimal;

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	password: string;
	roles: UserRole[];
	shift: Shift;
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	id: string;
	userId: string;
	token: string;
	expires: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface Customer {
	id: string;
	name: string | null;
	phone: string | null;
	email: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Category {
	id: string;
	name: string;
}

export interface InventoryItem {
	id: string;
	name: string;
	description: string | null;
	price: Decimal;
	stock: number;
	sku: string;
	barcode: string | null;
	categoryId: string;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface StockMovement {
	id: string;
	inventoryItemId: string;
	quantity: number;
	reason: string;
	notes: string | null;
	createdAt: Date;
}

export interface SaleItem {
	id: string;
	quantity: number;
	price: Decimal;
	saleId: string;
	inventoryItemId: string;
}

export interface Sale {
	id: string;
	total: Decimal;
	status: SaleStatus;
	paymentMethod: PaymentMethod | null;
	amountPaid: Decimal | null;
	changeGiven: Decimal | null;
	completedAt: Date | null;
	cancelledAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	customerId: string | null;
}

export interface ActivityLog {
	id: string;
	userId: string;
	action: string;
	details: string;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
}

export interface DashboardStats {
	totalSales: number;
	todaySales: number;
	totalOrders: number;
	todayOrders: number;
	lowStockItems: number;
	activeUsers: number;
}
