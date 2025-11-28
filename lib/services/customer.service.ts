import { prisma } from "@/lib/prisma";
import { Customer } from "@/generated/prisma/client";
import {
	CreateCustomerInput,
	UpdateCustomerInput,
} from "@/lib/validations/customer.schema";

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
export async function createCustomer(
	data: CreateCustomerInput,
): Promise<Customer> {
	// If phone is provided, check uniqueness
	if (data.phone) {
		const existingCustomer = await prisma.customer.findUnique({
			where: { phone: data.phone },
		});

		if (existingCustomer) {
			throw new Error("A customer with this phone number already exists");
		}
	}

	const customer = await prisma.customer.create({
		data: {
			name: data.name,
			phone: data.phone,
			email: data.email,
		},
	});

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
	data: UpdateCustomerInput,
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
 * @returns Array of customers with sales
 */
export async function listCustomers(): Promise<CustomerWithSales[]> {
	const customers = await prisma.customer.findMany({
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
