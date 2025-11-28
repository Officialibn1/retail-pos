/**
 * API Client Utilities
 * Provides wrapper functions for making authenticated API requests
 * with consistent error handling and response processing
 */

interface ApiError {
	message: string;
	code?: string;
	details?: any;
}

class ApiClientError extends Error {
	public statusCode: number;
	public code?: string;
	public details?: any;

	constructor(
		message: string,
		statusCode: number,
		code?: string,
		details?: any,
	) {
		super(message);
		this.name = "ApiClientError";
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
	}
}

interface FetchOptions extends RequestInit {
	params?: Record<string, string | number | boolean>;
}

/**
 * Makes an authenticated API request with automatic error handling
 * JWT token is automatically included via HTTP-only cookies
 */
export async function fetchWithAuth<T = any>(
	endpoint: string,
	options: FetchOptions = {},
): Promise<T> {
	const { params, ...fetchOptions } = options;

	// Build URL with query parameters if provided
	let url = endpoint;
	if (params) {
		const searchParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			searchParams.append(key, String(value));
		});
		url = `${endpoint}?${searchParams.toString()}`;
	}

	// Set default headers
	const headers = new Headers(fetchOptions.headers);
	if (!headers.has("Content-Type") && fetchOptions.body) {
		headers.set("Content-Type", "application/json");
	}

	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
			credentials: "include", // Include cookies for authentication
		});

		// Handle different response status codes
		if (!response.ok) {
			await handleErrorResponse(response);
		}

		// Handle 204 No Content
		if (response.status === 204) {
			return undefined as T;
		}

		// Parse JSON response
		const data = await response.json();
		return data as T;
	} catch (error) {
		// Re-throw ApiClientError as-is
		if (error instanceof ApiClientError) {
			throw error;
		}

		// Handle network errors or other unexpected errors
		if (error instanceof TypeError && error.message.includes("fetch")) {
			throw new ApiClientError(
				"Network error. Please check your connection.",
				0,
				"NETWORK_ERROR",
			);
		}

		// Handle JSON parsing errors
		if (error instanceof SyntaxError) {
			throw new ApiClientError(
				"Invalid response from server.",
				500,
				"INVALID_RESPONSE",
			);
		}

		// Unknown error
		throw new ApiClientError(
			"An unexpected error occurred.",
			500,
			"UNKNOWN_ERROR",
		);
	}
}

/**
 * Handles error responses from the API
 */
async function handleErrorResponse(response: Response): Promise<never> {
	let errorData: ApiError | null = null;

	try {
		errorData = await response.json();
	} catch {
		// If response is not JSON, use status text
		errorData = { message: response.statusText || "An error occurred" };
	}

	const message = errorData?.message || "An error occurred";
	const code = errorData?.code;
	const details = errorData?.details;

	// Map status codes to user-friendly messages
	switch (response.status) {
		case 400:
			throw new ApiClientError(
				message || "Invalid request data.",
				400,
				code || "VALIDATION_ERROR",
				details,
			);
		case 401:
			throw new ApiClientError(
				message || "Authentication required. Please log in.",
				401,
				code || "UNAUTHORIZED",
			);
		case 403:
			throw new ApiClientError(
				message || "You do not have permission to perform this action.",
				403,
				code || "FORBIDDEN",
			);
		case 404:
			throw new ApiClientError(
				message || "The requested resource was not found.",
				404,
				code || "NOT_FOUND",
			);
		case 409:
			throw new ApiClientError(
				message || "A conflict occurred with the current state.",
				409,
				code || "CONFLICT",
				details,
			);
		case 500:
			throw new ApiClientError(
				"An internal server error occurred. Please try again later.",
				500,
				code || "INTERNAL_ERROR",
			);
		default:
			throw new ApiClientError(
				message || "An unexpected error occurred.",
				response.status,
				code || "UNKNOWN_ERROR",
			);
	}
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
	get: <T = any>(endpoint: string, options?: FetchOptions) =>
		fetchWithAuth<T>(endpoint, { ...options, method: "GET" }),

	post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
		fetchWithAuth<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),

	put: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
		fetchWithAuth<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),

	delete: <T = any>(endpoint: string, options?: FetchOptions) =>
		fetchWithAuth<T>(endpoint, { ...options, method: "DELETE" }),

	patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
		fetchWithAuth<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		}),
};

export { ApiClientError };
