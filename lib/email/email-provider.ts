// Email provider - unified implementation with switch case for all providers

import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { Resend } from "resend";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { SendEmailParams } from "./types";

/**
 * Send email using the configured provider
 * Checks EMAIL_PROVIDER environment variable and uses appropriate transporter
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
	const provider = process.env.EMAIL_PROVIDER;

	if (!provider) {
		throw new Error("EMAIL_PROVIDER environment variable is not set");
	}

	switch (provider) {
		case "NODEMAILER":
			await sendWithNodeMailer(params);
			break;

		case "SENDGRID":
			await sendWithSendGrid(params);
			break;

		case "RESEND":
			await sendWithResend(params);
			break;

		case "AMAZON_SES":
			await sendWithAmazonSES(params);
			break;

		default:
			throw new Error(
				`Unsupported email provider: ${provider}. Must be one of: NODEMAILER, SENDGRID, RESEND, AMAZON_SES`,
			);
	}
}

/**
 * NodeMailer implementation
 */
async function sendWithNodeMailer(params: SendEmailParams): Promise<void> {
	const email = process.env.NODEMAILER_EMAIL;
	const password = process.env.NODEMAILER_PASSWORD;
	const host = process.env.NODEMAILER_HOST || "smtp.gmail.com";
	const port = parseInt(process.env.NODEMAILER_PORT || "587");

	if (!email || !password) {
		throw new Error("NODEMAILER_EMAIL and NODEMAILER_PASSWORD are required");
	}

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: {
			user: email,
			pass: password,
		},
	});

	await transporter.sendMail({
		from: email,
		to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
		subject: params.subject,
		html: params.html,
		text: params.text,
		attachments: params.attachments?.map((att) => ({
			filename: att.filename,
			content: att.content,
			contentType: att.contentType,
		})),
	});
}

/**
 * SendGrid implementation
 */
async function sendWithSendGrid(params: SendEmailParams): Promise<void> {
	const apiKey = process.env.SENDGRID_API_KEY;
	const fromEmail = process.env.SENDGRID_FROM_EMAIL;

	if (!apiKey || !fromEmail) {
		throw new Error("SENDGRID_API_KEY and SENDGRID_FROM_EMAIL are required");
	}

	sgMail.setApiKey(apiKey);

	await sgMail.send({
		to: Array.isArray(params.to) ? params.to : [params.to],
		from: fromEmail,
		subject: params.subject,
		html: params.html,
		text: params.text,
		attachments: params.attachments?.map((att) => ({
			filename: att.filename,
			content: Buffer.isBuffer(att.content)
				? att.content.toString("base64")
				: Buffer.from(att.content).toString("base64"),
			type: att.contentType || "application/octet-stream",
			disposition: "attachment",
		})),
	});
}

/**
 * Resend implementation
 */
async function sendWithResend(params: SendEmailParams): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const fromEmail = process.env.RESEND_FROM_EMAIL;

	if (!apiKey || !fromEmail) {
		throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL are required");
	}

	const resend = new Resend(apiKey);

	await resend.emails.send({
		from: fromEmail,
		to: Array.isArray(params.to) ? params.to : [params.to],
		subject: params.subject,
		html: params.html,
		text: params.text,
		attachments: params.attachments?.map((att) => ({
			filename: att.filename,
			content: Buffer.isBuffer(att.content)
				? att.content
				: Buffer.from(att.content),
		})),
	});
}

/**
 * Amazon SES implementation
 */
async function sendWithAmazonSES(params: SendEmailParams): Promise<void> {
	const fromEmail = process.env.SES_FROM_EMAIL;
	const region = process.env.AWS_REGION;
	const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
	const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

	if (!fromEmail || !region || !accessKeyId || !secretAccessKey) {
		throw new Error(
			"SES_FROM_EMAIL, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are required",
		);
	}

	const sesClient = new SESClient({
		region,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});

	const recipients = Array.isArray(params.to) ? params.to : [params.to];
	const rawMessage = buildRawEmailMessage(
		fromEmail,
		recipients,
		params.subject,
		params.html,
		params.text || "",
	);

	const command = new SendRawEmailCommand({
		RawMessage: {
			Data: Buffer.from(rawMessage),
		},
	});

	await sesClient.send(command);
}

/**
 * Build raw email message for Amazon SES
 */
function buildRawEmailMessage(
	from: string,
	to: string[],
	subject: string,
	html: string,
	text: string,
): string {
	const boundary = `----=_Part_${Date.now()}`;

	let message = `From: ${from}\r\n`;
	message += `To: ${to.join(", ")}\r\n`;
	message += `Subject: ${subject}\r\n`;
	message += `MIME-Version: 1.0\r\n`;
	message += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

	// Text part
	message += `--${boundary}\r\n`;
	message += `Content-Type: text/plain; charset=UTF-8\r\n\r\n`;
	message += `${text}\r\n\r\n`;

	// HTML part
	message += `--${boundary}\r\n`;
	message += `Content-Type: text/html; charset=UTF-8\r\n\r\n`;
	message += `${html}\r\n\r\n`;

	message += `--${boundary}--`;

	return message;
}
