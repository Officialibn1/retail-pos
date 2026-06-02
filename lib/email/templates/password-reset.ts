import { getStoreInfo } from "../store-info";
import type { PasswordResetEmailData } from "../types";

export async function generatePasswordResetEmail(data: PasswordResetEmailData): Promise<{
	html: string;
	text: string;
}> {
	const store = await getStoreInfo();
	const { userName, resetLink, otp, type, expiryMinutes } = data;

	const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, ${store.colors.primary} 0%, ${store.colors.secondary} 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        .message {
            margin-bottom: 25px;
            color: #555;
        }
        .otp-box {
            background: #f8f9fa;
            border: 2px dashed ${store.colors.primary};
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: ${store.colors.primary};
            font-family: 'Courier New', monospace;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: ${store.colors.primary};
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background: ${store.colors.secondary};
        }
        .expiry-notice {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .security-notice {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            color: #721c24;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
            border-top: none;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${store.name}</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Request</p>
    </div>
    
    <div class="content">
        <div class="greeting">Hello ${userName},</div>
        
        <div class="message">
            <p>We received a request to reset your password for your ${store.name} account.</p>
        </div>

        ${
					type === "OTP"
						? `
        <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your One-Time Password (OTP)</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Enter this code to reset your password</p>
        </div>
        
        <div class="expiry-notice">
            <strong>⏰ Important:</strong> This OTP will expire in ${expiryMinutes} minutes.
        </div>
        `
						: `
        <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Your Password</a>
        </div>
        
        <div class="expiry-notice">
            <strong>⏰ Important:</strong> This link will expire in ${expiryMinutes} minutes.
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; color: ${store.colors.primary}; font-size: 12px;">
            ${resetLink}
        </p>
        `
				}

        <div class="security-notice">
            <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact our support team immediately. Your account security is important to us.
        </div>
    </div>
    
    <div class="footer">
        <p style="margin: 0 0 10px 0;">This is an automated message from ${store.name}</p>
        <p style="margin: 0; color: #999; font-size: 12px;">Please do not reply to this email</p>
        
        <div class="contact-info">
            <p style="margin: 5px 0;"><strong>${store.name}</strong></p>
            ${store.address ? `<p style="margin: 5px 0;">${store.address}</p>` : ""}
            ${store.phone ? `<p style="margin: 5px 0;">Phone: ${store.phone}</p>` : ""}
            ${store.email ? `<p style="margin: 5px 0;">Email: ${store.email}</p>` : ""}
        </div>
    </div>
</body>
</html>
`;

	const text = `
${store.name}
Password Reset Request

Hello ${userName},

We received a request to reset your password for your ${store.name} account.

${
	type === "OTP"
		? `Your One-Time Password (OTP): ${otp}

Enter this code to reset your password.

⏰ Important: This OTP will expire in ${expiryMinutes} minutes.`
		: `Reset your password by clicking the link below:
${resetLink}

⏰ Important: This link will expire in ${expiryMinutes} minutes.`
}

🔒 Security Notice: If you didn't request this password reset, please ignore this email or contact our support team immediately.

---
This is an automated message from ${store.name}
Please do not reply to this email

${store.name}
${store.address || ""}
${store.phone ? `Phone: ${store.phone}` : ""}
${store.email ? `Email: ${store.email}` : ""}
`;

	return { html, text };
}
