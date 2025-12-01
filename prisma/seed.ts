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
		prisma.customer.create({
			data: {
				name: "Fatima Abubakar",
				phone: "+2348123456789",
				email: "fatima.abubakar@example.com",
			},
		}),
		prisma.customer.create({
			data: {
				name: "Chidi Okonkwo",
				phone: "+2347098765432",
				email: "chidi.okonkwo@example.com",
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

	// Create Sales - spanning 7 days from 1 week ago to today
	console.log("💰 Creating sales...");

	// Calculate dates - 7 days back from today
	const today = new Date();
	const getDateDaysAgo = (daysAgo: number) => {
		const date = new Date(today);
		date.setDate(date.getDate() - daysAgo);
		return date;
	};

	// Helper to set specific time on a date
	const setTime = (date: Date, hours: number, minutes: number) => {
		const newDate = new Date(date);
		newDate.setHours(hours, minutes, 0, 0);
		return newDate;
	};

	// DAY 1 - 7 days ago
	const day7ago = getDateDaysAgo(7);
	const sale1 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[0].id,
			subTotal: 5200.0,
			discountAmount: 200,
			taxAmount: 390,
			total: 5390.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CASH,
			amountPaid: 6000.0,
			changeGiven: 610.0,
			createdAt: setTime(day7ago, 10, 30),
			completedAt: setTime(day7ago, 10, 35),
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

	// DAY 2 - 6 days ago (2 sales)
	const day6ago = getDateDaysAgo(6);
	const sale2 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[1].id,
			subTotal: 8500.0,
			discountAmount: 0,
			taxAmount: 638,
			total: 9138.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CARD,
			amountPaid: 9138.0,
			changeGiven: 0.0,
			createdAt: setTime(day6ago, 9, 15),
			completedAt: setTime(day6ago, 9, 20),
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

	const sale3 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[2].id,
			subTotal: 3100.0,
			discountAmount: 100,
			taxAmount: 225,
			total: 3225.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CASH,
			amountPaid: 3500.0,
			changeGiven: 275.0,
			createdAt: setTime(day6ago, 14, 45),
			completedAt: setTime(day6ago, 14, 50),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[2].id, // Earphones
						quantity: 1,
						price: 2000.0,
					},
					{
						inventoryItemId: inventoryItems[7].id, // Water
						quantity: 3,
						price: 150.0,
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

	// DAY 3 - 5 days ago
	const day5ago = getDateDaysAgo(5);
	const sale4 = await prisma.sale.create({
		data: {
			userId: manager.id,
			customerId: customers[3].id,
			subTotal: 12300.0,
			discountAmount: 500,
			taxAmount: 885,
			total: 12685.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.MOBILE_MONEY,
			amountPaid: 12685.0,
			changeGiven: 0.0,
			createdAt: setTime(day5ago, 11, 20),
			completedAt: setTime(day5ago, 11, 25),
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

	// DAY 4 - 4 days ago (3 sales)
	const day4ago = getDateDaysAgo(4);
	const sale5 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[4].id,
			subTotal: 6600.0,
			discountAmount: 0,
			taxAmount: 495,
			total: 7095.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CARD,
			amountPaid: 7095.0,
			changeGiven: 0.0,
			createdAt: setTime(day4ago, 10, 0),
			completedAt: setTime(day4ago, 10, 5),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[3].id, // Rice
						quantity: 1,
						price: 4500.0,
					},
					{
						inventoryItemId: inventoryItems[5].id, // Sugar
						quantity: 1,
						price: 2200.0,
					},
				],
			},
		},
	});

	const sale6 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[0].id,
			subTotal: 1500.0,
			discountAmount: 0,
			taxAmount: 113,
			total: 1613.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CASH,
			amountPaid: 2000.0,
			changeGiven: 387.0,
			createdAt: setTime(day4ago, 13, 30),
			completedAt: setTime(day4ago, 13, 33),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[6].id, // Coca Cola
						quantity: 5,
						price: 300.0,
					},
				],
			},
		},
	});

	const sale7 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[1].id,
			subTotal: 2400.0,
			discountAmount: 0,
			taxAmount: 0,
			total: 2400.0,
			status: SaleStatus.CANCELLED,
			createdAt: setTime(day4ago, 15, 10),
			cancelledAt: setTime(day4ago, 15, 15),
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

	// DAY 5 - 3 days ago (2 sales)
	const day3ago = getDateDaysAgo(3);
	const sale8 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[2].id,
			subTotal: 4300.0,
			discountAmount: 300,
			taxAmount: 300,
			total: 4300.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.MOBILE_MONEY,
			amountPaid: 4300.0,
			changeGiven: 0.0,
			createdAt: setTime(day3ago, 9, 45),
			completedAt: setTime(day3ago, 9, 50),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[1].id, // Phone Charger
						quantity: 1,
						price: 3500.0,
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

	const sale9 = await prisma.sale.create({
		data: {
			userId: manager.id,
			customerId: customers[3].id,
			subTotal: 7200.0,
			discountAmount: 200,
			taxAmount: 525,
			total: 7525.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CARD,
			amountPaid: 7525.0,
			changeGiven: 0.0,
			createdAt: setTime(day3ago, 16, 20),
			completedAt: setTime(day3ago, 16, 25),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[3].id, // Rice
						quantity: 1,
						price: 4500.0,
					},
					{
						inventoryItemId: inventoryItems[4].id, // Oil
						quantity: 1,
						price: 1800.0,
					},
					{
						inventoryItemId: inventoryItems[6].id, // Coca Cola
						quantity: 3,
						price: 300.0,
					},
				],
			},
		},
	});

	// DAY 6 - 2 days ago
	const day2ago = getDateDaysAgo(2);
	const sale10 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[4].id,
			subTotal: 5100.0,
			discountAmount: 100,
			taxAmount: 375,
			total: 5375.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CASH,
			amountPaid: 6000.0,
			changeGiven: 625.0,
			createdAt: setTime(day2ago, 11, 0),
			completedAt: setTime(day2ago, 11, 5),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[0].id, // USB Cable
						quantity: 2,
						price: 1500.0,
					},
					{
						inventoryItemId: inventoryItems[10].id, // Toilet Paper
						quantity: 1,
						price: 1500.0,
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

	// DAY 7 - 1 day ago (Yesterday - 2 sales)
	const day1ago = getDateDaysAgo(1);
	const sale11 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			customerId: customers[1].id,
			subTotal: 9300.0,
			discountAmount: 0,
			taxAmount: 698,
			total: 9998.0,
			status: SaleStatus.COMPLETED,
			paymentMethod: PaymentMethod.CARD,
			amountPaid: 10000.0,
			changeGiven: 2.0,
			createdAt: setTime(day1ago, 10, 15),
			completedAt: setTime(day1ago, 10, 20),
			items: {
				create: [
					{
						inventoryItemId: inventoryItems[3].id, // Rice
						quantity: 2,
						price: 4500.0,
					},
				],
			},
		},
	});

	const sale12 = await prisma.sale.create({
		data: {
			userId: cashier.id,
			subTotal: 3300.0,
			discountAmount: 0,
			taxAmount: 0,
			total: 3300.0,
			status: SaleStatus.PENDING,
			createdAt: setTime(day1ago, 17, 30),
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

	console.log(
		`✅ Created 12 sales across 7 days (10 completed, 1 pending, 1 cancelled)`,
	);

	// Create Activity Logs
	console.log("📋 Creating activity logs...");
	const activityLogs = await Promise.all([
		prisma.activityLog.create({
			data: {
				userId: superadmin.id,
				action: "USER_LOGIN",
				details: "Superadmin logged in successfully",
				createdAt: setTime(day7ago, 8, 0),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_CREATED",
				details: `Created sale ${sale1.id}`,
				createdAt: setTime(day7ago, 10, 30),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale1.id} - Total: ₦5,390.00`,
				createdAt: setTime(day7ago, 10, 35),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "INVENTORY_UPDATED",
				details: `Updated stock for ${inventoryItems[0].name}`,
				createdAt: setTime(day6ago, 16, 0),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale2.id} - Total: ₦9,138.00`,
				createdAt: setTime(day6ago, 9, 20),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale3.id} - Total: ₦3,225.00`,
				createdAt: setTime(day6ago, 14, 50),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "SALE_COMPLETED",
				details: `Completed sale ${sale4.id} - Total: ₦12,685.00`,
				createdAt: setTime(day5ago, 11, 25),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: cashier.id,
				action: "SALE_CANCELLED",
				details: `Cancelled sale ${sale7.id}`,
				createdAt: setTime(day4ago, 15, 15),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: admin.id,
				action: "USER_LOGIN",
				details: "Admin logged in successfully",
				createdAt: setTime(day3ago, 8, 30),
			},
		}),
		prisma.activityLog.create({
			data: {
				userId: manager.id,
				action: "USER_LOGIN",
				details: "Manager logged in successfully",
				createdAt: setTime(day2ago, 8, 45),
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
