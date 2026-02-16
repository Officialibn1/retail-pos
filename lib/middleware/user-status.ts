import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/generated/prisma/client";

/**
 * Check if user is blocked
 * Blocked users cannot access the application at all
 */
export async function checkUserBlocked(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	return user?.status === UserStatus.BLOCKED;
}

/**
 * Check if user is suspended
 * Suspended users can read data but cannot perform mutations
 */
export async function checkUserSuspended(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	return user?.status === UserStatus.SUSPENDED;
}

/**
 * Middleware to check if user can perform mutations
 * Returns error response if user is suspended or blocked
 */
export async function requireActiveMutation(
	userId: string,
): Promise<NextResponse | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	if (!user) {
		return NextResponse.json(
			{
				error: {
					message: "User not found",
					code: "USER_NOT_FOUND",
				},
			},
			{ status: 404 },
		);
	}

	if (user.status === UserStatus.BLOCKED) {
		return NextResponse.json(
			{
				error: {
					message: "You have been blocked. Please contact your administrator.",
					code: "USER_BLOCKED",
				},
			},
			{ status: 403 },
		);
	}

	if (user.status === UserStatus.SUSPENDED) {
		return NextResponse.json(
			{
				error: {
					message:
						"You have been suspended from performing operations. Please contact your administrator.",
					code: "USER_SUSPENDED",
				},
			},
			{ status: 403 },
		);
	}

	return null; // User is active, can proceed
}

/**
 * Middleware to check if user can access the application
 * Returns error response if user is blocked
 * Suspended users can still read data
 */
export async function requireActiveAccess(
	userId: string,
): Promise<NextResponse | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { status: true },
	});

	if (!user) {
		return NextResponse.json(
			{
				error: {
					message: "User not found",
					code: "USER_NOT_FOUND",
				},
			},
			{ status: 404 },
		);
	}

	if (user.status === UserStatus.BLOCKED) {
		return NextResponse.json(
			{
				error: {
					message: "You have been blocked. Please contact your administrator.",
					code: "USER_BLOCKED",
				},
			},
			{ status: 403 },
		);
	}

	return null; // User can access (active or suspended)
}
