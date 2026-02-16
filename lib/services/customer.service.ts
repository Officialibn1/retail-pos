import { prisma } from "@/lib/prisma";
import { Customer, Prisma } from "@/generated/prisma/client";
import { CustomerInput } from "@/lib/validations/customer.schema";
import { sendCustomerWelcomeEmail } from "@/lib/email";

/**
 * Customer with sales history
 */
export type CustomerWithSales = Customer & {
	sales: Array<{
		id: string;
		total: number;
		status: string;
		createdAt: Date;
	}>;
};

/**
 * Create a new customer with phone uniqueness check
 * @param data - Customer creation data
 * @returns Created customer
 */
export async function createCustomer(data: CustomerInput): Promise<Customer> {
	// If phone is provided, check uniqueness
	if (data.phone) {
		const existingCustomer = await prisma.customer.findUnique({
			where: { phone: data.phone },
		});

		if (existingCustomer) {
			throw new Error("A customer with this phone number already exists");
		}
	}

	if (data.email) {
		const existingCustomer = await prisma.customer.findFirst({
			where: { email: data.email },
		});

		if (existingCustomer) {
			throw new Error("A customer with this email already exists");
		}
	}

	const customer = await prisma.customer.create({
		data: {
			name: data.name,
			phone: data.phone,
			email: data.email,
		},
	});

	// Send welcome email if customer has email
	if (customer.email) {
		try {
			await sendCustomerWelcomeEmail(customer.email, {
				customerName: customer.name || "Valued Customer",
				phone: customer.phone,
			});
		} catch (emailError) {
			console.error("Failed to send customer welcome email:", emailError);
			// Don't fail customer creation if email fails
		}
	}

	return customer;
}

/**
 * Get customer by ID with sales history
 * @param id - Customer ID
 * @returns Customer with sales or null if not found
 */
export async function getCustomerById(
	id: string,
): Promise<CustomerWithSales | null> {
	const customer = await prisma.customer.findUnique({
		where: { id },
		include: {
			sales: {
				select: {
					id: true,
					total: true,
					status: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
	});

	return customer;
}

/**
 * Update customer with validation
 * @param id - Customer ID
 * @param data - Customer update data
 * @returns Updated customer
 */
export async function updateCustomer(
	id: string,
	data: CustomerInput,
): Promise<Customer> {
	// If phone is being updated, check uniqueness
	if (data.phone) {
		const existingCustomer = await prisma.customer.findFirst({
			where: {
				phone: data.phone,
				NOT: { id },
			},
		});

		if (existingCustomer) {
			throw new Error("A customer with this phone number already exists");
		}
	}

	// If email is being updated, check uniqueness
	if (data.email) {
		const existingCustomer = await prisma.customer.findFirst({
			where: {
				email: data.email,
				NOT: { id },
			},
		});

		if (existingCustomer) {
			throw new Error("A customer with this email already exists");
		}
	}

	const customer = await prisma.customer.update({
		where: { id },
		data: {
			name: data.name,
			phone: data.phone,
			email: data.email,
		},
	});

	return customer;
}

/**
 * Delete customer with reference check
 * @param id - Customer ID
 * @throws Error if customer has associated sales
 */
export async function deleteCustomer(id: string): Promise<void> {
	// Check if customer has associated sales
	const customer = await prisma.customer.findUnique({
		where: { id },
		include: {
			sales: {
				select: { id: true },
				take: 1,
			},
		},
	});

	if (!customer) {
		throw new Error("Customer not found");
	}

	if (customer.sales.length > 0) {
		throw new Error(
			"Cannot delete customer with existing sales. Customer has purchase history.",
		);
	}

	await prisma.customer.delete({
		where: { id },
	});
}

/**
 * List all customers with sales history
 * @param params - URL search parameters for filtering
 * @returns Array of customers with sales
 */
export async function listCustomers(
	params: URLSearchParams,
): Promise<CustomerWithSales[]> {
	const searchTerm = params.get("searchTerm");

	const searchConditions: Prisma.CustomerWhereInput[] = [];

	if (searchTerm) {
		searchConditions.push({
			name: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		searchConditions.push({
			email: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});

		searchConditions.push({
			phone: {
				contains: searchTerm,
				mode: "insensitive" as const,
			},
		});
	}

	const whereCondition =
		searchConditions.length > 0 ? { OR: searchConditions } : {};

	const customers = await prisma.customer.findMany({
		where: whereCondition,
		include: {
			sales: {
				select: {
					id: true,
					total: true,
					status: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return customers;
}
