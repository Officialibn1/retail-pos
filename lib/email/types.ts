// Email provider types and interfaces

export type EmailProvider = "NODEMAILER" | "SENDGRID" | "RESEND" | "AMAZON_SES";

export interface EmailConfig {
	provider: EmailProvider;
	from: string;
}

export interface EmailAttachment {
	filename: string;
	content: string | Buffer;
	contentType?: string;
}

export interface SendEmailParams {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	attachments?: EmailAttachment[];
}

export interface EmailProviderInterface {
	sendEmail(params: SendEmailParams): Promise<void>;
}

// Email template data types
export interface UserStatusEmailData {
	userName: string;
	status: "ACTIVE" | "BLOCKED" | "SUSPENDED";
	reason?: string;
}

export interface PurchaseEmailData {
	customerName: string;
	saleId: string;
	items: Array<{
		name: string;
		quantity: number;
		price: number;
		total: number;
	}>;
	subtotal: number;
	discount: number;
	tax: number;
	total: number;
	paymentMethod: string;
	date: Date;
}

export interface CanceledOrdersEmailData {
	canceledOrders: Array<{
		id: string;
		customerName?: string;
		total: number;
		createdAt: Date;
	}>;
	totalAmount: number;
	date: Date;
}

export interface UserCreationEmailData {
	userName: string;
	email: string;
	username: string;
	password: string;
	roles: string[];
}

export interface CustomerWelcomeEmailData {
	customerName: string;
	phone: string;
}
