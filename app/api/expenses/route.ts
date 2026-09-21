import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createExpenseSchema } from "@/lib/validations/expense.schema";
import {
	createExpense,
	listExpenses,
} from "@/lib/services/expense.service";
import { ZodError } from "zod";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses
 * List all expenses (MANAGER+ only)
 */
export async function GET(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const searchParams = request.nextUrl.searchParams;

		const expenses = await listExpenses({
			searchTerm: searchParams.get("searchTerm") ?? undefined,
			category: searchParams.get("category") ?? undefined,
			startDate: searchParams.get("startDate") ?? undefined,
			endDate: searchParams.get("endDate") ?? undefined,
		});

		return NextResponse.json({ expenses, count: expenses.length });
	} catch (error) {
		console.error("Error listing expenses:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/expenses
 * Create a new expense (MANAGER+ only)
 */
export async function POST(request: NextRequest) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const body = await request.json();
		const validatedData = createExpenseSchema.parse(body);

		const expense = await createExpense(validatedData, authResult.request.user.id);

		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		await logActivity(
			user.id,
			"EXPENSE_CREATED",
			`Recorded expense: ${expense.title} (${expense.category}) — ₦${Number(expense.amount).toLocaleString()}`,
			ipAddress,
			undefined,
			{ entityType: "Expense", entityId: expense.id },
		);

		return NextResponse.json(
			{ message: "Expense recorded successfully", expense },
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		console.error("Error creating expense:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
