import { prisma } from "@/lib/prisma";

export interface StoreSettings {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string;
	taxRate: number; // decimal, e.g. 0.075 = 7.5%
	primaryColor: string;
	secondaryColor: string;
	logoUrl: string;
}

// Module-level cache — invalidated on write
let cache: StoreSettings | null = null;

function rowToSettings(row: {
	id: string;
	name: string;
	address: string;
	phone: string;
	email: string | null;
	taxRate: { toString(): string };
	primaryColor: string;
	secondaryColor: string;
	logoUrl: string;
}): StoreSettings {
	return {
		id: row.id,
		name: row.name,
		address: row.address,
		phone: row.phone,
		email: row.email ?? "",
		taxRate: Number(row.taxRate),
		primaryColor: row.primaryColor,
		secondaryColor: row.secondaryColor,
		logoUrl: row.logoUrl,
	};
}

export async function getStoreSettings(): Promise<StoreSettings> {
	if (cache) return cache;

	// Always use the first (and only) row — don't assume a fixed id
	let row = await prisma.storeInfo.findFirst();

	if (!row) {
		row = await prisma.storeInfo.create({
			data: {
				id: "singleton",
				name: "POS Store",
				address: "",
				phone: "",
				primaryColor: "#7c3aed",
				secondaryColor: "#a78bfa",
				logoUrl: "/pos_logo.png",
			},
		});
	}

	cache = rowToSettings(row);
	return cache;
}

export async function updateStoreSettings(
	data: Partial<Omit<StoreSettings, "id">>,
): Promise<StoreSettings> {
	// Get the real row id first
	const existing = await getStoreSettings();

	const row = await prisma.storeInfo.update({
		where: { id: existing.id },
		data,
	});

	cache = rowToSettings(row);
	return cache;
}
