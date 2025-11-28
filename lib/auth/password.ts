import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	return hashedPassword;
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	const isValid = await bcrypt.compare(password, hash);
	return isValid;
}

/**
 * Create a password reset token for a user
 * @param userId - User ID to create reset token for
 * @returns Reset token string
 */
export async function createResetToken(userId: string): Promise<string> {
	// Generate a secure random token
	const token = crypto.randomBytes(32).toString("hex");

	// Calculate expiration (1 hour from now)
	const expires = new Date();
	expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

	// Store token in database
	await prisma.passwordResetToken.create({
		data: {
			token,
			userId,
			expires,
		},
	});

	return token;
}

/**
 * Verify a password reset token
 * @param token - Reset token to verify
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyResetToken(token: string): Promise<string | null> {
	const resetToken = await prisma.passwordResetToken.findUnique({
		where: { token },
	});

	if (!resetToken) {
		return null;
	}

	// Check if token has expired
	if (resetToken.expires < new Date()) {
		// Delete expired token
		await prisma.passwordResetToken.delete({
			where: { id: resetToken.id },
		});
		return null;
	}

	return resetToken.userId;
}
