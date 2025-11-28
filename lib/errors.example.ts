/**
 * Example usage of error handling utilities
 * This file demonstrates how to use the error handlers in API routes
 */

import { NextRequest, NextResponse } from "next/server";
import {
	handleError,
	handleValidationError,
	handlePrismaError,
	handleNotFoundError,
	handleAuthenticationError,
	handleAuthorizationError,
	handleBusinessRuleError,
	withErrorHandling,
	formatErrorResponse,
	ErrorCode,
} from "@/lib/errors";
import { z, ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

/**
 * Example 1: Using handleError for automatic error routing
 */
export async function exampleRoute1(request: NextRequest) {
	try {
		// Your route logic here
		throw new Error("Something went wrong");
	} catch (error) {
		// Automatically routes to appropriate handler based on error type
		return handleError(error, "exampleRoute1");
	}
}

/**
 * Example 2: Using withErrorHandling wrapper
 */
export const exampleRoute2 = withErrorHandling(async (request: NextRequest) => {
	// Your route logic here
	// Errors are automatically caught and handled
	return NextResponse.json({ success: true });
}, "exampleRoute2");

/**
 * Example 3: Handling specific error types
 */
export async function exampleRoute3(request: NextRequest) {
	try {
		const schema = z.object({
			email: z.string().email(),
		});

		const body = await request.json();
		const data = schema.parse(body);

		return NextResponse.json({ data });
	} catch (error) {
		// Handle Zod validation errors specifically
		if (error instanceof ZodError) {
			return handleValidationError(error);
		}

		// Handle Prisma errors specifically
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			return handlePrismaError(error);
		}

		// Default error handling
		return handleError(error, "exampleRoute3");
	}
}

/**
 * Example 4: Using specific error handlers
 */
export async function exampleRoute4(request: NextRequest) {
	// Check if user is authenticated
	const token = request.cookies.get("auth-token");
	if (!token) {
		return handleAuthenticationError("Please log in to continue");
	}

	// Check if user has permission
	const hasPermission = false; // Your permission check logic
	if (!hasPermission) {
		return handleAuthorizationError(
			"You don't have permission to access this resource",
			{
				required: ["ADMIN"],
				current: ["USER"],
			},
		);
	}

	// Check if resource exists
	const resource = null; // Your database query
	if (!resource) {
		return handleNotFoundError("User", "123");
	}

	// Business rule validation
	const stockAvailable = false; // Your business logic
	if (!stockAvailable) {
		return handleBusinessRuleError("Insufficient stock available", {
			requested: 10,
			available: 5,
		});
	}

	return NextResponse.json({ success: true });
}

/**
 * Example 5: Using formatErrorResponse for custom errors
 */
export async function exampleRoute5(request: NextRequest) {
	try {
		// Your route logic here
		const customCondition = false;

		if (!customCondition) {
			return formatErrorResponse(
				"Custom error message",
				ErrorCode.BUSINESS_RULE_VIOLATION,
				{ customField: "customValue" },
				422,
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		return handleError(error, "exampleRoute5");
	}
}
