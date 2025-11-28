import jwt from "jsonwebtoken";
import { UserRole } from "@/generated/prisma/client";

export interface JWTPayload {
	userId: string;
	email: string;
	roles: UserRole[];
}

export interface TokenPair {
	token: string;
	expiresAt: Date;
}

/**
 * Generate a JWT token with user payload
 * @param payload - User information to encode in the token
 * @returns Token string and expiration date
 */
export function generateToken(payload: JWTPayload): TokenPair {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

	const token = jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);

	// Calculate expiration date (24 hours from now by default)
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 24);

	return {
		token,
		expiresAt,
	};
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not set");
	}

	try {
		const decoded = jwt.verify(token, secret) as JWTPayload;
		return decoded;
	} catch (error) {
		// Token is invalid or expired
		return null;
	}
}

/**
 * Extract JWT token from request cookies
 * @param request - Next.js request object
 * @returns Token string or null if not found
 */
export function getTokenFromCookies(request: Request): string | null {
	const cookieHeader = request.headers.get("cookie");

	if (!cookieHeader) {
		return null;
	}

	// Parse cookies manually
	const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
		const [key, value] = cookie.trim().split("=");
		acc[key] = value;
		return acc;
	}, {} as Record<string, string>);

	return cookies["auth-token"] || null;
}
