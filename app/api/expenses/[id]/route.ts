import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { updateExpenseSchema } from "@/lib/validations/expense.schema";
import {
	getExpenseById,
	updateExpense,
	deleteExpense,
} from "@/lib/services/expense.service";
import { ZodError } from "zod";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/[id]
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const expense = await getExpenseById(params.id);

		if (!expense) {
			return NextResponse.json(
				{ error: { message: "Expense not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		return NextResponse.json({ expense });
	} catch (error) {
		console.error("Error fetching expense:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/expenses/[id]
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const body = await request.json();
		const validatedData = updateExpenseSchema.parse(body);

		const expense = await updateExpense(params.id, validatedData);

		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		await logActivity(
			user.id,
			"EXPENSE_UPDATED",
			`Updated expense: ${expense.title}`,
			ipAddress,
			undefined,
			{ entityType: "Expense", entityId: expense.id },
		);

		return NextResponse.json({ message: "Expense updated successfully", expense });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: { message: "Validation failed", code: "VALIDATION_ERROR", details: error.errors } },
				{ status: 400 },
			);
		}

		if (
			error instanceof Error &&
			error.message.includes("Record to update not found")
		) {
			return NextResponse.json(
				{ error: { message: "Expense not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		console.error("Error updating expense:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/expenses/[id]
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) return authResult;

		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) return roleCheck;

		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) return statusCheck;

		const existing = await getExpenseById(params.id);
		if (!existing) {
			return NextResponse.json(
				{ error: { message: "Expense not found", code: "NOT_FOUND" } },
				{ status: 404 },
			);
		}

		await deleteExpense(params.id);

		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		await logActivity(
			user.id,
			"EXPENSE_DELETED",
			`Deleted expense: ${existing.title}`,
			ipAddress,
			undefined,
			{ entityType: "Expense", entityId: params.id },
		);

		return NextResponse.json({ message: "Expense deleted successfully" });
	} catch (error) {
		console.error("Error deleting expense:", error);
		return NextResponse.json(
			{ error: { message: "An unexpected error occurred", code: "INTERNAL_ERROR" } },
			{ status: 500 },
		);
	}
}
