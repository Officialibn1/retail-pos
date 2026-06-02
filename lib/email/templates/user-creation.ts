// User creation email template

import { UserCreationEmailData } from "../types";
import {
	getStoreInfo,
	generateStoreHeader,
	generateStoreFooterText,
} from "../store-info";

export async function generateUserCreationEmail(data: UserCreationEmailData): Promise<{
	html: string;
	text: string;
}> {
	const { userName, email, username, password, roles } = data;
	const storeInfo = await getStoreInfo();
	const storeHeader = generateStoreHeader(storeInfo);
	const storeFooter = generateStoreFooterText(storeInfo);

	const rolesText = roles.join(", ");

	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to POS System</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Store Header -->
                <tr>
                  <td style="padding: 30px 30px 0;">
                    ${storeHeader}
                  </td>
                </tr>
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${storeInfo.colors.primary} 0%, ${storeInfo.colors.secondary} 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px;">Welcome to ${storeInfo.name}!</h1>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">Your account has been created</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                      Hello <strong>${userName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                      Your account has been successfully created. Below are your login credentials:
                    </p>
                    
                    <!-- Credentials Box -->
                    <div style="background-color: #f9fafb; border: 2px solid ${storeInfo.colors.primary}; border-radius: 8px; padding: 25px; margin: 0 0 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Email:</p>
                            <p style="margin: 5px 0 0; font-size: 16px; color: #111827; font-weight: bold;">${email}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Username:</p>
                            <p style="margin: 5px 0 0; font-size: 16px; color: #111827; font-weight: bold;">${username}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Temporary Password:</p>
                            <p style="margin: 5px 0 0; font-size: 18px; color: ${storeInfo.colors.primary}; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 2px;">${password}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Role(s):</p>
                            <p style="margin: 5px 0 0; font-size: 16px; color: #111827; font-weight: bold;">${rolesText}</p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 30px;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: bold;">
                        🔒 Important Security Notice
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #92400e;">
                        Please change your password immediately after your first login. Go to Settings → Change Password.
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                      You can now log in to the system and start using your account.
                    </p>
                    
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      If you have any questions or need assistance, please contact your system administrator${storeInfo.phone ? ` at ${storeInfo.phone}` : ""}${storeInfo.email ? ` or email ${storeInfo.email}` : ""}.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #374151;">
                      Welcome to the team!
                    </p>
                    <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                      This is an automated message from ${storeInfo.name}. Please do not reply to this email.
                    </p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 5px 0; font-size: 12px; color: #6b7280;"><strong>${storeInfo.name}</strong></p>
                      ${storeInfo.address ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">${storeInfo.address}</p>` : ""}
                      ${storeInfo.phone ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Phone: ${storeInfo.phone}</p>` : ""}
                      ${storeInfo.email ? `<p style="margin: 5px 0; font-size: 12px; color: #6b7280;">Email: ${storeInfo.email}</p>` : ""}
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
${storeInfo.name}
${storeInfo.address ? storeInfo.address + "\n" : ""}${storeInfo.phone ? "Tel: " + storeInfo.phone + "\n" : ""}
WELCOME TO ${storeInfo.name.toUpperCase()}

Hello ${userName},

Your account has been successfully created. Below are your login credentials:

Email: ${email}
Username: ${username}
Temporary Password: ${password}
Role(s): ${rolesText}

IMPORTANT SECURITY NOTICE:
Please change your password immediately after your first login.
Go to Settings → Change Password.

You can now log in to the system and start using your account.

If you have any questions or need assistance, please contact your system administrator${storeInfo.phone ? ` at ${storeInfo.phone}` : ""}${storeInfo.email ? ` or email ${storeInfo.email}` : ""}.

Welcome to the team!
${storeFooter}

---
This is an automated message from ${storeInfo.name}. Please do not reply to this email.
  `.trim();

	return { html, text };
}
