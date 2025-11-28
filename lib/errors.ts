/**
 * Error Handling Utilities
 * Provides consistent error response formatting and handling for the API
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

/**
 * Standard error response format
 */
export interface ErrorResponse {
	error: {
		message: string;
		code: string;
		details?: any;
	};
}

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
	// Validation errors (400)
	VALIDATION_ERROR = "VALIDATION_ERROR",
	INVALID_INPUT = "INVALID_INPUT",

	// Authentication errors (401)
	UNAUTHORIZED = "UNAUTHORIZED",
	INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
	INVALID_TOKEN = "INVALID_TOKEN",
	SESSION_EXPIRED = "SESSION_EXPIRED",

	// Authorization errors (403)
	FORBIDDEN = "FORBIDDEN",
	INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

	// Not found errors (404)
	NOT_FOUND = "NOT_FOUND",
	RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

	// Conflict errors (409)
	CONFLICT = "CONFLICT",
	DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
	CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",

	// Business logic errors (422)
	BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
	INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
	RESOURCE_IN_USE = "RESOURCE_IN_USE",

	// Server errors (500)
	INTERNAL_ERROR = "INTERNAL_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
}

/**
 * Format error response with consistent structure
 * @param message - Human-readable error message
 * @param code - Error code for client handling
 * @param details - Optional additional error details
 * @param status - HTTP status code
 * @returns NextResponse with formatted error
 */
export function formatErrorResponse(
	message: string,
	code: ErrorCode | string,
	details?: any,
	status: number = 500,
): NextResponse {
	const errorResponse: ErrorResponse = {
		error: {
			message,
			code,
			...(details && { details }),
		},
	};

	return NextResponse.json(errorResponse, { status });
}

/**
 * Handle Zod validation errors
 * Converts Zod error format to user-friendly validation error response
 * @param error - ZodError instance
 * @returns NextResponse with validation error details
 */
export function handleValidationError(error: ZodError): NextResponse {
	const formattedErrors = error.errors.map((err) => ({
		field: err.path.join("."),
		message: err.message,
		code: err.code,
	}));

	return formatErrorResponse(
		"Validation failed. Please check your input data.",
		ErrorCode.VALIDATION_ERROR,
		formattedErrors,
		400,
	);
}

/**
 * Handle Prisma database errors
 * Converts Prisma-specific errors to user-friendly messages
 * @param error - Prisma error instance
 * @returns NextResponse with appropriate error message
 */
export function handlePrismaError(error: unknown): NextResponse {
	// Unique constraint violation
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		const knownError = error as Prisma.PrismaClientKnownRequestError;
		switch (knownError.code) {
			case "P2002": {
				// Unique constraint violation
				const target = (knownError.meta?.target as string[]) || [];
				const field = target[0] || "field";
				return formatErrorResponse(
					`A record with this ${field} already exists.`,
					ErrorCode.DUPLICATE_RESOURCE,
					{ field, constraint: "unique" },
					409,
				);
			}

			case "P2003": {
				// Foreign key constraint violation
				const field = (knownError.meta?.field_name as string) || "field";
				return formatErrorResponse(
					`Invalid reference: ${field} does not exist.`,
					ErrorCode.CONSTRAINT_VIOLATION,
					{ field, constraint: "foreign_key" },
					400,
				);
			}

			case "P2025": {
				// Record not found
				return formatErrorResponse(
					"The requested resource was not found.",
					ErrorCode.NOT_FOUND,
					undefined,
					404,
				);
			}

			case "P2014": {
				// Required relation violation
				const relation =
					(knownError.meta?.relation_name as string) || "relation";
				return formatErrorResponse(
					`Cannot perform operation: ${relation} is required.`,
					ErrorCode.CONSTRAINT_VIOLATION,
					{ relation, constraint: "required_relation" },
					400,
				);
			}

			case "P2023": {
				// Invalid ID format
				return formatErrorResponse(
					"Invalid ID format provided.",
					ErrorCode.INVALID_INPUT,
					undefined,
					400,
				);
			}

			default: {
				// Other known Prisma errors
				console.error("Prisma error:", knownError);
				return formatErrorResponse(
					"A database error occurred.",
					ErrorCode.DATABASE_ERROR,
					undefined,
					500,
				);
			}
		}
	}

	// Validation error (e.g., required field missing)
	if (error instanceof Prisma.PrismaClientValidationError) {
		const validationError = error as Prisma.PrismaClientValidationError;
		console.error("Prisma validation error:", validationError);
		return formatErrorResponse(
			"Invalid data provided to database.",
			ErrorCode.VALIDATION_ERROR,
			undefined,
			400,
		);
	}

	// Connection/initialization errors
	if (error instanceof Prisma.PrismaClientInitializationError) {
		const initError = error as Prisma.PrismaClientInitializationError;
		console.error("Prisma initialization error:", initError);
		return formatErrorResponse(
			"Database connection failed.",
			ErrorCode.DATABASE_ERROR,
			undefined,
			500,
		);
	}

	// Rust panic errors
	if (error instanceof Prisma.PrismaClientRustPanicError) {
		const panicError = error as Prisma.PrismaClientRustPanicError;
		console.error("Prisma panic error:", panicError);
		return formatErrorResponse(
			"A critical database error occurred.",
			ErrorCode.DATABASE_ERROR,
			undefined,
			500,
		);
	}

	// Unknown initialization errors
	if (error instanceof Prisma.PrismaClientUnknownRequestError) {
		const unknownError = error as Prisma.PrismaClientUnknownRequestError;
		console.error("Prisma unknown error:", unknownError);
		return formatErrorResponse(
			"A database error occurred.",
			ErrorCode.DATABASE_ERROR,
			undefined,
			500,
		);
	}

	// Unknown Prisma error
	console.error("Unknown Prisma error:", error);
	return formatErrorResponse(
		"A database error occurred.",
		ErrorCode.DATABASE_ERROR,
		undefined,
		500,
	);
}

/**
 * Handle authentication errors
 * Returns 401 Unauthorized response
 * @param message - Optional custom error message
 * @returns NextResponse with authentication error
 */
export function handleAuthenticationError(
	message: string = "Authentication required",
): NextResponse {
	return formatErrorResponse(message, ErrorCode.UNAUTHORIZED, undefined, 401);
}

/**
 * Handle authorization errors
 * Returns 403 Forbidden response
 * @param message - Optional custom error message
 * @param details - Optional details about required permissions
 * @returns NextResponse with authorization error
 */
export function handleAuthorizationError(
	message: string = "Insufficient permissions to access this resource",
	details?: any,
): NextResponse {
	return formatErrorResponse(message, ErrorCode.FORBIDDEN, details, 403);
}

/**
 * Handle not found errors
 * Returns 404 Not Found response
 * @param resource - Name of the resource that was not found
 * @param id - Optional ID of the resource
 * @returns NextResponse with not found error
 */
export function handleNotFoundError(
	resource: string = "Resource",
	id?: string,
): NextResponse {
	const message = id
		? `${resource} with ID '${id}' not found`
		: `${resource} not found`;

	return formatErrorResponse(
		message,
		ErrorCode.NOT_FOUND,
		{ resource, ...(id && { id }) },
		404,
	);
}

/**
 * Handle business rule violations
 * Returns 422 Unprocessable Entity response
 * @param message - Description of the business rule violation
 * @param details - Optional additional details
 * @returns NextResponse with business rule error
 */
export function handleBusinessRuleError(
	message: string,
	details?: any,
): NextResponse {
	return formatErrorResponse(
		message,
		ErrorCode.BUSINESS_RULE_VIOLATION,
		details,
		422,
	);
}

/**
 * Handle internal server errors
 * Logs the full error server-side but returns generic message to client
 * @param error - The error that occurred
 * @param context - Optional context about where the error occurred
 * @returns NextResponse with generic internal error
 */
export function handleInternalError(
	error: unknown,
	context?: string,
): NextResponse {
	// Log full error details server-side
	if (context) {
		console.error(`Internal error in ${context}:`, error);
	} else {
		console.error("Internal error:", error);
	}

	// Return generic error to client (don't expose internal details)
	return formatErrorResponse(
		"An unexpected error occurred. Please try again later.",
		ErrorCode.INTERNAL_ERROR,
		undefined,
		500,
	);
}

/**
 * Generic error handler that routes to appropriate specific handler
 * @param error - The error to handle
 * @param context - Optional context about where the error occurred
 * @returns NextResponse with appropriate error response
 */
export function handleError(error: unknown, context?: string): NextResponse {
	// Zod validation errors
	if (error instanceof ZodError) {
		return handleValidationError(error);
	}

	// Prisma errors - check all Prisma error types
	if (
		error instanceof Prisma.PrismaClientKnownRequestError ||
		error instanceof Prisma.PrismaClientValidationError ||
		error instanceof Prisma.PrismaClientInitializationError ||
		error instanceof Prisma.PrismaClientRustPanicError ||
		error instanceof Prisma.PrismaClientUnknownRequestError
	) {
		return handlePrismaError(error);
	}

	// Custom error types (if we add them later)
	if (error instanceof Error) {
		// Check for specific error messages that indicate known error types
		if (error.message.includes("not found")) {
			return handleNotFoundError("Resource");
		}
		if (
			error.message.includes("unauthorized") ||
			error.message.includes("authentication")
		) {
			return handleAuthenticationError(error.message);
		}
		if (
			error.message.includes("forbidden") ||
			error.message.includes("permission")
		) {
			return handleAuthorizationError(error.message);
		}
	}

	// Default to internal error
	return handleInternalError(error, context);
}

/**
 * Async error wrapper for API route handlers
 * Automatically catches and handles errors in async functions
 * @param handler - Async function to wrap
 * @param context - Optional context for error logging
 * @returns Wrapped function that handles errors
 */
export function withErrorHandling<T extends any[]>(
	handler: (...args: T) => Promise<NextResponse>,
	context?: string,
) {
	return async (...args: T): Promise<NextResponse> => {
		try {
			return await handler(...args);
		} catch (error) {
			return handleError(error, context);
		}
	};
}
