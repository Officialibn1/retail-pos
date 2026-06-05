import { prisma } from "@/lib/prisma";
import { CashDrawerSession } from "@/generated/prisma/client";
import { OpenShiftInput, CloseShiftInput } from "@/lib/validations/cash-drawer.schema";

export type CashDrawerSessionWithUser = CashDrawerSession & {
	user: {
		id: string;
		name: string;
		email: string;
	};
};

/**
 * Get the currently active (open) session for a user.
 * An active session has no closedAt date.
 */
export async function getActiveSession(
	userId: string,
): Promise<CashDrawerSessionWithUser | null> {
	return prisma.cashDrawerSession.findFirst({
		where: {
			userId,
			closedAt: null,
		},
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { openedAt: "desc" },
	});
}

/**
 * Get the most recent session for a user, regardless of status.
 */
export async function getLatestSession(
	userId: string,
): Promise<CashDrawerSessionWithUser | null> {
	return prisma.cashDrawerSession.findFirst({
		where: { userId },
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { openedAt: "desc" },
	});
}

/**
 * Open a new cash drawer session for a user.
 * Throws if the user already has an open session.
 */
export async function openSession(
	userId: string,
	data: OpenShiftInput,
): Promise<CashDrawerSessionWithUser> {
	// Ensure no open session exists
	const existing = await getActiveSession(userId);
	if (existing) {
		throw new Error("You already have an open shift. Please close it first.");
	}

	return prisma.cashDrawerSession.create({
		data: {
			userId,
			openingFloat: data.openingFloat,
			notes: data.notes ?? null,
		},
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
	});
}

/**
 * Close an open session.
 * Calculates expected cash based on cash sales during the shift,
 * records the variance, and timestamps the close.
 */
export async function closeSession(
	sessionId: string,
	userId: string,
	data: CloseShiftInput,
): Promise<CashDrawerSessionWithUser> {
	// Fetch the session
	const session = await prisma.cashDrawerSession.findUnique({
		where: { id: sessionId },
	});

	if (!session) {
		throw new Error("Shift session not found.");
	}

	if (session.userId !== userId) {
		throw new Error("You can only close your own shift.");
	}

	if (session.closedAt) {
		throw new Error("This shift is already closed.");
	}

	// Calculate expected cash: opening float + cash sales during this shift
	const cashSalesAgg = await prisma.sale.aggregate({
		where: {
			userId,
			paymentMethod: "CASH",
			status: "COMPLETED",
			completedAt: {
				gte: session.openedAt,
			},
		},
		_sum: {
			total: true,
		},
	});

	const cashSalesTotal = Number(cashSalesAgg._sum.total ?? 0);
	const expectedClose = Number(session.openingFloat) + cashSalesTotal;
	const variance = data.declaredClose - expectedClose;

	return prisma.cashDrawerSession.update({
		where: { id: sessionId },
		data: {
			declaredClose: data.declaredClose,
			expectedClose,
			variance,
			closedAt: new Date(),
			notes: data.notes ?? session.notes,
		},
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
	});
}

/**
 * Get all sessions with optional filters.
 */
export async function listSessions(params: URLSearchParams): Promise<CashDrawerSessionWithUser[]> {
	const userId = params.get("userId") || undefined;
	const limit = Number(params.get("limit") || "50");

	return prisma.cashDrawerSession.findMany({
		where: userId ? { userId } : undefined,
		include: {
			user: {
				select: { id: true, name: true, email: true },
			},
		},
		orderBy: { openedAt: "desc" },
		take: limit,
	});
}
