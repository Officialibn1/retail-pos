// Email service main entry point

import { sendEmail } from "./email-provider";
import { generateUserStatusEmail } from "./templates/user-status";
import { generatePurchaseReceiptEmail } from "./templates/purchase-receipt";
import { generateCanceledOrdersEmail } from "./templates/canceled-orders";
import { generateUserCreationEmail } from "./templates/user-creation";
import { generateCustomerWelcomeEmail } from "./templates/customer-welcome";
import { generatePasswordResetEmail } from "./templates/password-reset";
import type {
	UserStatusEmailData,
	PurchaseEmailData,
	CanceledOrdersEmailData,
	UserCreationEmailData,
	CustomerWelcomeEmailData,
	PasswordResetEmailData,
} from "./types";

export async function sendUserStatusEmail(
	to: string,
	data: UserStatusEmailData,
): Promise<void> {
	try {
		const { html, text } = await generateUserStatusEmail(data);

		const statusTitles = {
			ACTIVE: "Account Activated",
			BLOCKED: "Account Blocked",
			SUSPENDED: "Account Suspended",
		};

		await sendEmail({
			to,
			subject: statusTitles[data.status],
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send user status email:", error);
		throw error;
	}
}

export async function sendUserCreationEmail(
	to: string,
	data: UserCreationEmailData,
): Promise<void> {
	try {
		const { html, text } = await generateUserCreationEmail(data);

		await sendEmail({
			to,
			subject: "Welcome to POS System - Your Account Details",
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send user creation email:", error);
		throw error;
	}
}

export async function sendCustomerWelcomeEmail(
	to: string,
	data: CustomerWelcomeEmailData,
): Promise<void> {
	try {
		const { html, text } = await generateCustomerWelcomeEmail(data);

		await sendEmail({
			to,
			subject: "Welcome! Thank You for Joining Us",
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send customer welcome email:", error);
		throw error;
	}
}

export async function sendPasswordResetEmail(
	to: string,
	data: PasswordResetEmailData,
): Promise<void> {
	try {
		const { html, text } = await generatePasswordResetEmail(data);

		const subject =
			data.type === "OTP"
				? "Password Reset OTP - Action Required"
				: "Password Reset Link - Action Required";

		await sendEmail({
			to,
			subject,
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send password reset email:", error);
		throw error;
	}
}

export async function sendPurchaseReceiptEmail(
	to: string,
	data: PurchaseEmailData,
): Promise<void> {
	try {
		const { html, text } = await generatePurchaseReceiptEmail(data);

		await sendEmail({
			to,
			subject: `Purchase Receipt - Order #${data.saleId}`,
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send purchase receipt email:", error);
		throw error;
	}
}

export async function sendCanceledOrdersEmail(
	recipients: string[],
	data: CanceledOrdersEmailData,
): Promise<void> {
	try {
		const { html, text } = await generateCanceledOrdersEmail(data);

		await sendEmail({
			to: recipients,
			subject: `Automated Order Cancellation Report - ${data.canceledOrders.length} Orders Canceled`,
			html,
			text,
		});
	} catch (error) {
		console.error("Failed to send canceled orders email:", error);
		throw error;
	}
}

export * from "./types";
