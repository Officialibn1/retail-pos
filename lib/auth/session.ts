import { prisma } from "@/lib/prisma";

export interface SessionData {
	id: string;
	userId: string;
	token: string;
	expires: Date;
}

/**
 * Create a new session in the database
 * @param userId - User ID to create session for
 * @param token - JWT token to store
 * @returns Created session data
 */
export async function createSession(
	userId: string,
	token: string,
): Promise<SessionData> {
	// Calculate expiration (24 hours from now)
	const expires = new Date();
	expires.setHours(expires.getHours() + 24);

	const session = await prisma.session.create({
		data: {
			userId,
			token,
			expires,
		},
	});

	return {
		id: session.id,
		userId: session.userId,
		token: session.token,
		expires: session.expires,
	};
}

/**
 * Get a session by token and verify it hasn't expired
 * @param token - JWT token to look up
 * @returns Session data or null if not found or expired
 */
export async function getSession(token: string): Promise<SessionData | null> {
	const session = await prisma.session.findUnique({
		where: { token },
	});

	if (!session) {
		return null;
	}

	// Check if session has expired
	if (session.expires < new Date()) {
		// Delete expired session
		await prisma.session.delete({
			where: { id: session.id },
		});
		return null;
	}

	return {
		id: session.id,
		userId: session.userId,
		token: session.token,
		expires: session.expires,
	};
}

/**
 * Delete a session from the database
 * @param token - JWT token of session to delete
 */
export async function deleteSession(token: string): Promise<void> {
	await prisma.session.deleteMany({
		where: { token },
	});
}

/**
 * Clean up expired sessions from the database
 * This should be run periodically as a maintenance task
 */
export async function cleanupExpiredSessions(): Promise<void> {
	await prisma.session.deleteMany({
		where: {
			expires: {
				lt: new Date(),
			},
		},
	});
}
