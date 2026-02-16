import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireManager } from "@/lib/middleware/auth";
import { requireActiveMutation } from "@/lib/middleware/user-status";
import { createInventoryItemSchema } from "@/lib/validations/inventory.schema";
import {
	createInventoryItem,
	listInventoryItems,
} from "@/lib/services/inventory.service";
import { ZodError } from "zod";
import { logActivity } from "@/lib/services/activity-log.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		// Check MANAGER+ role
		const roleCheck = requireManager()(authResult.request);
		if (roleCheck) {
			return roleCheck;
		}

		// Check if user can perform mutations
		const statusCheck = await requireActiveMutation(authResult.request.user.id);
		if (statusCheck) {
			return statusCheck;
		}

		// Parse and validate request body
		const body = await request.json();
		const validatedData = createInventoryItemSchema.parse(body);

		// Create inventory item
		const item = await createInventoryItem(validatedData);

		// Log activity
		const user = authResult.request.user;
		const ipAddress =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";
		await logActivity(
			user.id,
			"INVENTORY_CREATED",
			`Created inventory item: ${item.name} (SKU: ${item.sku})`,
			ipAddress,
		);

		return NextResponse.json(
			{
				message: "Inventory item created successfully",
				item,
			},
			{ status: 201 },
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					error: {
						message: "Validation failed",
						code: "VALIDATION_ERROR",
						details: error.errors,
					},
				},
				{ status: 400 },
			);
		}

		// Handle uniqueness constraint errors
		if (error instanceof Error && error.message.includes("already exists")) {
			return NextResponse.json(
				{
					error: {
						message: error.message,
						code: "DUPLICATE_SKU",
					},
				},
				{ status: 409 },
			);
		}

		// Handle unexpected errors
		console.error("Error creating inventory item:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const params = request.nextUrl.searchParams;

		const authResult = await requireAuth(request);
		if (authResult instanceof NextResponse) {
			return authResult;
		}

		const items = await listInventoryItems(false, params);

		return NextResponse.json(items);
	} catch (error) {
		console.error("Error listing inventory items:", error);
		return NextResponse.json(
			{
				error: {
					message: "An unexpected error occurred",
					code: "INTERNAL_ERROR",
				},
			},
			{ status: 500 },
		);
	}
}
