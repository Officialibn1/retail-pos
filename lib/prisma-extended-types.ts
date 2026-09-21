import { Prisma, User } from "@/generated/prisma";

const inventoryItemWithCategory =
	Prisma.validator<Prisma.InventoryItemDefaultArgs>()({
		include: {
			category: true,
		},
	});

const inventoryItemWithCategoryAndSupplier =
	Prisma.validator<Prisma.InventoryItemDefaultArgs>()({
		include: {
			category: true,
			supplier: {
				select: { id: true, name: true },
			},
		},
	});

const categoryWithItems =
	Prisma.validator<Prisma.InventoryItemCategoryDefaultArgs>()({
		include: {
			inventoryItems: true,
		},
	});

const categoryWithCount =
	Prisma.validator<Prisma.InventoryItemCategoryDefaultArgs>()({
		include: {
			_count: {
				select: {
					inventoryItems: true,
				},
			},
		},
	});

const activityLogWithUser = Prisma.validator<Prisma.ActivityLogDefaultArgs>()({
	include: {
		user: {
			select: {
				id: true,
				name: true,
				email: true,
			},
		},
	},
});

const saleItemWithInventoryItem =
	Prisma.validator<Prisma.SaleItemDefaultArgs>()({
		include: {
			inventoryItem: {
				select: {
					id: true,
					name: true,
					sku: true,
				},
			},
		},
	});

const supplierWithCounts =
	Prisma.validator<Prisma.SupplierDefaultArgs>()({
		include: {
			_count: {
				select: {
					inventoryItems: true,
					purchaseOrders: true,
				},
			},
		},
	});

const purchaseOrderWithDetails =
	Prisma.validator<Prisma.PurchaseOrderDefaultArgs>()({
		include: {
			supplier: {
				select: { id: true, name: true, phone: true, email: true },
			},
			items: {
				include: {
					inventoryItem: {
						select: { id: true, name: true, sku: true },
					},
				},
			},
		},
	});

export type CategoryWithItems = Prisma.InventoryItemCategoryGetPayload<
	typeof categoryWithItems
>;
export type CategoryWithCount = Prisma.InventoryItemCategoryGetPayload<
	typeof categoryWithCount
>;

export type InventoryItemWithCategory = Prisma.InventoryItemGetPayload<
	typeof inventoryItemWithCategory
>;

export type InventoryItemWithCategoryAndSupplier =
	Prisma.InventoryItemGetPayload<typeof inventoryItemWithCategoryAndSupplier>;

export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<
	typeof activityLogWithUser
>;

export type SaleItemWithInventoryItem = Prisma.SaleItemGetPayload<
	typeof saleItemWithInventoryItem
>;

export type SupplierWithCounts = Prisma.SupplierGetPayload<
	typeof supplierWithCounts
>;

export type PurchaseOrderWithDetails = Prisma.PurchaseOrderGetPayload<
	typeof purchaseOrderWithDetails
>;

export type UserWithoutPassword = Omit<User, "password">;
