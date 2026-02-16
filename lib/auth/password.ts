import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const OTP_EXPIRY_MINUTES = 10;

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
 * Generate a 6-digit OTP
 * @returns 6-digit OTP string
 */
export function generateOTP(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a password reset token for a user
 * @param userId - User ID to create reset token for
 * @param type - Type of reset (LINK or OTP)
 * @returns Reset token string and OTP (if type is OTP)
 */
export async function createResetToken(
	userId: string,
	type: "LINK" | "OTP" = "LINK",
): Promise<{ token: string; otp?: string }> {
	// Generate a secure random token
	const token = crypto.randomBytes(32).toString("hex");

	// Generate OTP if type is OTP
	const otp = type === "OTP" ? generateOTP() : undefined;

	// Calculate expiration
	const expires = new Date();
	if (type === "OTP") {
		expires.setMinutes(expires.getMinutes() + OTP_EXPIRY_MINUTES);
	} else {
		expires.setHours(expires.getHours() + RESET_TOKEN_EXPIRY_HOURS);
	}

	// Delete any existing reset tokens for this user
	await prisma.passwordResetToken.deleteMany({
		where: { userId },
	});

	// Store token in database
	await prisma.passwordResetToken.create({
		data: {
			token,
			userId,
			otp,
			type,
			expires,
		},
	});

	return { token, otp };
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

/**
 * Verify an OTP for password reset
 * @param email - User email
 * @param otp - OTP to verify
 * @returns Token string if OTP is valid, null otherwise
 */
export async function verifyOTP(
	email: string,
	otp: string,
): Promise<string | null> {
	// Find user by email
	const user = await prisma.user.findUnique({
		where: { email },
		include: {
			passwordResetTokens: {
				where: {
					otp,
					type: "OTP",
					expires: {
						gte: new Date(),
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 1,
			},
		},
	});

	if (!user || user.passwordResetTokens.length === 0) {
		return null;
	}

	return user.passwordResetTokens[0].token;
}
