// User status change email template

import { getStoreInfo } from "../store-info";
import { UserStatusEmailData } from "../types";

export async function generateUserStatusEmail(data: UserStatusEmailData): Promise<{
	html: string;
	text: string;
}> {
	const { userName, status, reason } = data;
	const store = await getStoreInfo();

	const statusMessages = {
		ACTIVE: {
			title: "Account Activated",
			message:
				"Your account has been activated and you can now access the system.",
			color: "#10b981",
		},
		BLOCKED: {
			title: "Account Blocked",
			message:
				"Your account has been blocked and you no longer have access to the system.",
			color: "#ef4444",
		},
		SUSPENDED: {
			title: "Account Suspended",
			message: "Your account has been temporarily suspended.",
			color: "#f59e0b",
		},
	};

	const statusInfo = statusMessages[status];

	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${statusInfo.color}; padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${statusInfo.title}</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                      Hello <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                      ${statusInfo.message}
                    </p>
                    
                    ${
											reason
												? `
                      <div style="background-color: #f9fafb; border-left: 4px solid ${statusInfo.color}; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                          <strong>Reason:</strong> ${reason}
                        </p>
                      </div>
                    `
												: ""
										}
                    
                    <p style="margin: 20px 0 0; font-size: 14px; color: #6b7280;">
                      If you have any questions, please contact your system administrator.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                      This is an automated message from ${store.name}. Please do not reply to this email.
                    </p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 5px 0; font-size: 12px; color: #6b7280;"><strong>${store.name}</strong></p>
                      ${store.address ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">${store.address}</p>` : ""}
                      ${store.phone ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Phone: ${store.phone}</p>` : ""}
                      ${store.email ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Email: ${store.email}</p>` : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

	const text = `
${statusInfo.title}

Hello ${userName},

${statusInfo.message}

${reason ? `Reason: ${reason}` : ""}

If you have any questions, please contact your system administrator.

---
This is an automated message from ${store.name}. Please do not reply to this email.

${store.name}
${store.address || ""}
${store.phone ? `Phone: ${store.phone}` : ""}
${store.email ? `Email: ${store.email}` : ""}
  `.trim();

	return { html, text };
}
