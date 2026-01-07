import { Prisma, User } from "@/generated/prisma";

const inventoryItemWithCategory =
	Prisma.validator<Prisma.InventoryItemDefaultArgs>()({
		include: {
			category: true,
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

export type CategoryWithItems = Prisma.InventoryItemCategoryGetPayload<
	typeof categoryWithItems
>;
export type CategoryWithCount = Prisma.InventoryItemCategoryGetPayload<
	typeof categoryWithCount
>;

export type InventoryItemWithCategory = Prisma.InventoryItemGetPayload<
	typeof inventoryItemWithCategory
>;

export type ActivityLogWithUser = Prisma.ActivityLogGetPayload<
	typeof activityLogWithUser
>;

export type SaleItemWithInventoryItem = Prisma.SaleItemGetPayload<
	typeof saleItemWithInventoryItem
>;

export type UserWithoutPassword = Omit<User, "password">;
