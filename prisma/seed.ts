import {
	UserRole,
	Shift,
	SaleStatus,
	PaymentMethod,
} from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
	console.log("🌱 Starting database seed...");

	// Clear existing data (in reverse order of dependencies)
	console.log("🧹 Cleaning existing data...");
	await prisma.saleItem.deleteMany();
	await prisma.sale.deleteMany();
	await prisma.stockMovement.deleteMany();
	await prisma.inventoryItem.deleteMany();
	await prisma.inventoryItemCategory.deleteMany();
	await prisma.customer.deleteMany();
	await prisma.session.deleteMany();
	await prisma.passwordResetToken.deleteMany();
	await prisma.user.deleteMany();

	// Create Users (one per role)
	console.log("👥 Creating users...");
	const superadmin = await prisma.user.create({
		data: {
			email: "superadmin@pos.com",
			username: "superadmin",
			name: "Super Administrator",
			password: await hashPassword("password123"),
			roles: [UserRole.SUPERADMIN],
			shift: Shift.FULLTIME,
		},
	});

	const admin = await prisma.user.create({
		data: {
			email: "admin@pos.com",
			username: "admin",
			name: "Admin User",
			password: await hashPassword("password123"),
			roles: [UserRole.ADMIN],
			shift: Shift.FULLTIME,
		},
	});

	const manager = await prisma.user.create({
		data: {
			email: "manager@pos.com",
			username: "manager",
			name: "Store Manager",
			password: await hashPassword("password123"),
			roles: [UserRole.MANAGER],
			shift: Shift.MORNING,
		},
	});

	const cashier = await prisma.user.create({
		data: {
			email: "cashier@pos.com",
			username: "cashier",
			name: "Cashier User",
			password: await hashPassword("password123"),
			roles: [UserRole.CASHIER],
			shift: Shift.EVENING,
		},
	});

	console.log(`✅ Created ${4} users`);

	// Create Customers
	console.log("🛍️ Creating customers...");
	const customers = await Promise.all([
		prisma.customer.create({
			data: {
				name: "John Doe",
				phone: "+2348012345678",
				email: "john.doe@example.com",
			},
		}),
		prisma.customer.create({
			data: {
				name: "Jane Smith",
				phone: "+2348087654321",
				email: "jane.smith@example.com",
			},
		}),
		prisma.customer.create({
			data: {
				name: "Ahmed Ibrahim",
				phone: "+2347012345678",
				email: "ahmed.ibrahim@example.com",
			},
		}),
	]);

	console.log(`✅ Created ${customers.length} customers`);

	// Create Categories
	console.log("📦 Creating categories...");
	const categories = await Promise.all([
		prisma.inventoryItemCategory.create({
			data: { name: "Electronics" },
		}),
		prisma.inventoryItemCategory.create({
			data: { name: "Groceries" },
		}),
		prisma.inventoryItemCategory.create({
			data: { name: "Beverages" },
		}),
		prisma.inventoryItemCategory.create({
			data: { name: "Household Items" },
		}),
	]);

	console.log(`✅ Created ${categories.length} categories`);

	// Create Inventory Items
	console.log("📦 Creating inventory items...");
	const inventoryItems = await Promise.all([
		// Electronics
		prisma.inventoryItem.create({
			data: {
				name: "USB Cable Type-C",
				description: "High-speed USB Type-C charging cable",
				price: 1500.0,
				stock: 50,
				sku: "ELEC-USB-001",
				barcode: "1234567890123",
				categoryId: categories[0].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Phone Charger",
				description: "Fast charging adapter 20W",
				price: 3500.0,
				stock: 30,
				sku: "ELEC-CHG-001",
				barcode: "1234567890124",
				categoryId: categories[0].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Earphones",
				description: "Wired earphones with microphone",
				price: 2000.0,
				stock: 45,
				sku: "ELEC-EAR-001",
				barcode: "1234567890125",
				categoryId: categories[0].id,
			},
		}),
		// Groceries
		prisma.inventoryItem.create({
			data: {
				name: "Rice 5kg",
				description: "Premium long grain rice",
				price: 4500.0,
				stock: 100,
				sku: "GROC-RIC-001",
				barcode: "2234567890123",
				categoryId: categories[1].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Vegetable Oil 1L",
				description: "Pure vegetable cooking oil",
				price: 1800.0,
				stock: 75,
				sku: "GROC-OIL-001",
				barcode: "2234567890124",
				categoryId: categories[1].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Sugar 2kg",
				description: "Refined white sugar",
				price: 2200.0,
				stock: 60,
				sku: "GROC-SUG-001",
				barcode: "2234567890125",
				categoryId: categories[1].id,
			},
		}),
		// Beverages
		prisma.inventoryItem.create({
			data: {
				name: "Coca Cola 50cl",
				description: "Carbonated soft drink",
				price: 300.0,
				stock: 200,
				sku: "BEV-COK-001",
				barcode: "3234567890123",
				categoryId: categories[2].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Bottled Water 75cl",
				description: "Pure table water",
				price: 150.0,
				stock: 300,
				sku: "BEV-WAT-001",
				barcode: "3234567890124",
				categoryId: categories[2].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Fruit Juice 1L",
				description: "Mixed fruit juice drink",
				price: 800.0,
				stock: 80,
				sku: "BEV-JUI-001",
				barcode: "3234567890125",
				categoryId: categories[2].id,
			},
		}),
		// Household Items
		prisma.inventoryItem.create({
			data: {
				name: "Detergent Powder 500g",
				description: "Laundry washing powder",
				price: 1200.0,
				stock: 90,
				sku: "HOU-DET-001",
				barcode: "4234567890123",
				categoryId: categories[3].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Toilet Paper 4-pack",
				description: "Soft toilet tissue rolls",
				price: 1500.0,
				stock: 120,
				sku: "HOU-TIS-001",
				barcode: "4234567890124",
				categoryId: categories[3].id,
			},
		}),
		prisma.inventoryItem.create({
			data: {
				name: "Dish Soap 500ml",
				description: "Liquid dishwashing soap",
				price: 600.0,
				stock: 85,
				sku: "HOU-SOP-001",
				barcode: "4234567890125",
				categoryId: categories[3].id,
			},
		}),
	]);

	console.log(`✅ Created ${inventoryItems.length} inventory items`);

	// Create Stock Movements
	console.log("📊 Creating stock movements...");
	const stockMovements = await Promise.all([
		prisma.stockMovement.create({
			data: {
				inventoryItemId: inventoryItems[0].id,
				quantity: 50,
				reason: "Initial stock",
				notes: "Opening inventory",
			},
		}),
		prisma.stockMovement.create({
			data: {
				inventoryItemId: inventoryItems[3].id,
				quantity: 100,
				reason: "Initial stock",
				notes: "Opening inventory",
			},
		}),
		prisma.stockMovement.create({
			data: {
				inventoryItemId: inventoryItems[6].id,
				quantity: 200,
				reason: "Initial stock",
				notes: "Opening inventory",
			},
		}),
		prisma.stockMovement.create({
			data: {
				inventoryItemId: inventoryItems[0].id,
				quantity: -5,
				reason: "Sale",
				notes: "Sold to customer",
			},
		}),
	]);

	console.log(`✅ Created ${stockMovements.length} stock movements`);

	// Create Sales
	console.log("💰 Creating sales...");

	// Completed Sale 1
	const sale1 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[0].id,
			total: 5200.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CASH,
			amountPaid: 6000.0,
			changeGiven: 800.0,
			completedAt: new Date("2024-11-20T10:30:00"),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[0].id, // USB Cable
						quantity: 2,
						price: 1500.0,
					},
					{
						inventoryItemId: inventoryItems[6].id, // Coca Cola
						quantity: 5,
						price: 300.0,
					},
					{
						inventoryItemId: inventoryItems[9].id, // Detergent
						quantity: 1,
						price: 1200.0,
					},
				],
			},
		},
	});

	// Completed Sale 2
	const sale2 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[1].id,
			total: 8500.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CARD,
			amountPaid: 8500.0,
			changeGiven: 0.0,
			completedAt: new Date("2024-11-21T14:15:00"),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[3].id, // Rice
						quantity: 1,
						price: 4500.0,
					},
					{
						inventoryItemId: inventoryItems[4].id, // Oil
						quantity: 2,
						price: 1800.0,
					},
					{
						inventoryItemId: inventoryItems[11].id, // Dish Soap
						quantity: 1,
						price: 600.0,
					},
				],
			},
		},
	});

	// Completed Sale 3
	const sale3 = await prisma.sale.create({
		data: {
			userId: manager.id,
			customerId: customers[2].id,
			total: 12300.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.MOBILE_MONEY,
			amountPaid: 12300.0,
			changeGiven: 0.0,
			completedAt: new Date("2024-11-22T16:45:00"),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[1].id, // Phone Charger
						quantity: 2,
						price: 3500.0,
					},
					{
						inventoryItemId: inventoryItems[5].id, // Sugar
						quantity: 2,
						price: 2200.0,
					},
					{
						inventoryItemId: inventoryItems[8].id, // Fruit Juice
						quantity: 1,
						price: 800.0,
					},
				],
			},
		},
	});

	// Pending Sale
	const sale4 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			total: 3300.0,
			status: SaleStatus.PENDING,
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[2].id, // Earphones
						quantity: 1,
						price: 2000.0,
					},
					{
						inventoryItemId: inventoryItems[7].id, // Water
						quantity: 2,
						price: 150.0,
					},
					{
						inventoryItemId: inventoryItems[10].id, // Toilet Paper
						quantity: 1,
						price: 1500.0,
					},
				],
			},
		},
	});

	// Cancelled Sale
	const sale5 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[0].id,
			total: 2400.0,
			status: SaleStatus.CANCELLED,
			cancelledAt: new Date("2024-11-23T11:20:00"),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[4].id, // Oil
						quantity: 1,
						price: 1800.0,
					},
					{
						inventoryItemId: inventoryItems[11].id, // Dish Soap
						quantity: 1,
						price: 600.0,
					},
				],
			},
		},
	});

	console.log(`✅ Created 5 sales (3 completed, 1 pending, 1 cancelled)`);

	// Create Activity Logs
	console.log("📋 Creating activity logs...");
	const activityLogs = await Promise.all([
		prisma.activityLog.create({
			data: {
				userId: superadmin.id,
				action: "USER_LOGIN",
				details: "Superadmin logged in successfully",
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_CREATED",
				details: `Created sale ${sale1.id}`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale1.id} - Total: ₦5200.00`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "INVENTORY_UPDATED",
				details: `Updated stock for ${inventoryItems[0].name}`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_CREATED",
				details: `Created sale ${sale2.id}`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale2.id} - Total: ₦8500.00`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale3.id} - Total: ₦12300.00`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_CANCELLED",
				details: `Cancelled sale ${sale5.id}`,
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: admin.id,
				action: "USER_LOGIN",
				details: "Admin logged in successfully",
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "USER_LOGIN",
				details: "Manager logged in successfully",
			},
		}),
	]);

	console.log(`✅ Created ${activityLogs.length} activity logs`);

	console.log("\n🎉 Database seeded successfully!");
	console.log("\n📝 Test User Credentials:");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log("SUPERADMIN:");
	console.log("  Email: superadmin@pos.com");
	console.log("  Password: password123");
	console.log("\nADMIN:");
	console.log("  Email: admin@pos.com");
	console.log("  Password: password123");
	console.log("\nMANAGER:");
	console.log("  Email: manager@pos.com");
	console.log("  Password: password123");
	console.log("\nCASHIER:");
	console.log("  Email: cashier@pos.com");
	console.log("  Password: password123");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
