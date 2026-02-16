import { prisma } from "@/lib/prisma";
import { UserStatus, UserRole } from "@/generated/prisma/client";
import { sendUserStatusEmail } from "@/lib/email";

/**
 * Get user status by user ID
 * @param userId - User ID
 * @returns User status or null if user not found
 */
export async function getUserStatus(
	userId: string,
): Promise<UserStatus | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	return user?.status || null;
}

/**
 * Update user status
 * Prevents SUPERADMIN users from being blocked or suspended
 * @param userId - User ID
 * @param newStatus - New status to set
 * @returns Updated user status
 * @throws Error if user not found or if attempting to block/suspend SUPERADMIN
 */
export async function updateUserStatus(
	userId: string,
	newStatus: UserStatus,
): Promise<{ status: UserStatus; userId: string }> {
	// Get user with roles to check if SUPERADMIN
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			roles: true,
			status: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	// Prevent blocking or suspending SUPERADMIN users
	if (user.roles.includes(UserRole.SUPERADMIN)) {
		if (
			newStatus === UserStatus.BLOCKED ||
			newStatus === UserStatus.SUSPENDED
		) {
			throw new Error(
				"Cannot block or suspend SUPERADMIN users. SUPERADMIN users must always remain active.",
			);
		}
	}

	// Update user status
	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: { status: newStatus },
		select: {
			id: true,
			status: true,
			name: true,
			email: true,
		},
	});

	// Send email notification if user has email
	if (updatedUser.email) {
		try {
			await sendUserStatusEmail(updatedUser.email, {
				userName: updatedUser.name,
				status: newStatus,
			});
		} catch (emailError) {
			console.error("Failed to send user status email:", emailError);
			// Don't fail the status update if email fails
		}
	}

	return {
		userId: updatedUser.id,
		status: updatedUser.status,
	};
}

/**
 * Check if user can have their status changed
 * @param userId - User ID
 * @returns Boolean indicating if status can be changed
 */
export async function canChangeUserStatus(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { roles: true },
	});

	if (!user) {
		return false;
	}

	// SUPERADMIN users cannot have their status changed to BLOCKED or SUSPENDED
	return !user.roles.includes(UserRole.SUPERADMIN);
}
