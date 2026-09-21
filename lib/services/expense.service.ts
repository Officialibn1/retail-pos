import { prisma } from "@/lib/prisma";
import { Expense, Prisma } from "@/generated/prisma/client";
import {
	CreateExpenseInput,
	UpdateExpenseInput,
} from "@/lib/validations/expense.schema";

export type ExpenseWithRecordedBy = Prisma.ExpenseGetPayload<{
	include: {
		recordedBy: {
			select: { id: true; name: true; email: true };
		};
	};
}>;

export interface ExpenseSearchParams {
	searchTerm?: string;
	category?: string;
	startDate?: string;
	endDate?: string;
}

/**
 * Create a new expense record
 */
export async function createExpense(
	data: CreateExpenseInput,
	recordedById: string,
): Promise<ExpenseWithRecordedBy> {
	const expense = await prisma.expense.create({
		data: {
			title: data.title,
			amount: data.amount,
			category: data.category,
			description: data.description ?? null,
			date: data.date ? new Date(data.date) : new Date(),
			recordedById,
		},
		include: {
			recordedBy: {
				select: { id: true, name: true, email: true },
			},
		},
	});

	return expense;
}

/**
 * Get expense by ID
 */
export async function getExpenseById(
	id: string,
): Promise<ExpenseWithRecordedBy | null> {
	return prisma.expense.findUnique({
		where: { id },
		include: {
			recordedBy: {
				select: { id: true, name: true, email: true },
			},
		},
	});
}

/**
 * List all expenses with optional search/filter
 */
export async function listExpenses(
	params: ExpenseSearchParams = {},
): Promise<ExpenseWithRecordedBy[]> {
	const conditions: Prisma.ExpenseWhereInput[] = [];

	if (params.searchTerm) {
		conditions.push({
			OR: [
				{
					title: {
						contains: params.searchTerm,
						mode: "insensitive" as const,
					},
				},
				{
					description: {
						contains: params.searchTerm,
						mode: "insensitive" as const,
					},
				},
			],
		});
	}

	if (params.category && params.category !== "all") {
		conditions.push({ category: params.category as any });
	}

	if (params.startDate) {
		conditions.push({ date: { gte: new Date(params.startDate) } });
	}

	if (params.endDate) {
		// End of day for inclusive range
		const end = new Date(params.endDate);
		end.setHours(23, 59, 59, 999);
		conditions.push({ date: { lte: end } });
	}

	return prisma.expense.findMany({
		where: conditions.length > 0 ? { AND: conditions } : {},
		include: {
			recordedBy: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { date: "desc" },
	});
}

/**
 * Update an expense record
 */
export async function updateExpense(
	id: string,
	data: UpdateExpenseInput,
): Promise<ExpenseWithRecordedBy> {
	const expense = await prisma.expense.update({
		where: { id },
		data: {
			...(data.title !== undefined && { title: data.title }),
			...(data.amount !== undefined && { amount: data.amount }),
			...(data.category !== undefined && { category: data.category }),
			...(data.description !== undefined && {
				description: data.description ?? null,
			}),
			...(data.date !== undefined && { date: new Date(data.date) }),
		},
		include: {
			recordedBy: {
				select: { id: true, name: true, email: true },
			},
		},
	});

	return expense;
}

/**
 * Delete an expense record
 */
export async function deleteExpense(id: string): Promise<void> {
	await prisma.expense.delete({ where: { id } });
}

/**
 * Get total expenses amount for a date range (used by analytics)
 */
export async function getTotalExpenses(
	startDate?: Date,
	endDate?: Date,
): Promise<number> {
	const where: Prisma.ExpenseWhereInput = {};
	if (startDate || endDate) {
		where.date = {};
		if (startDate) (where.date as any).gte = startDate;
		if (endDate) (where.date as any).lte = endDate;
	}

	const result = await prisma.expense.aggregate({
		where,
		_sum: { amount: true },
	});

	return Number(result._sum.amount ?? 0);
}
