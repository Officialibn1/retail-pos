// Customer welcome email template

import { CustomerWelcomeEmailData } from "../types";
import {
	getStoreInfo,
	generateStoreHeader,
	generateStoreFooterText,
} from "../store-info";

export function generateCustomerWelcomeEmail(data: CustomerWelcomeEmailData): {
	html: string;
	text: string;
} {
	const { customerName, phone } = data;
	const storeInfo = getStoreInfo();
	const storeHeader = generateStoreHeader(storeInfo);
	const storeFooter = generateStoreFooterText(storeInfo);

	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome!</title>
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
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px;">Welcome!</h1>
                    <p style="margin: 0; color: #d1fae5; font-size: 16px;">Thank you for joining us</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 18px; color: #374151;">
                      Dear <strong>${customerName}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                      Welcome to ${storeInfo.name}! We're thrilled to have you as our valued customer. Your account has been successfully created in our system.
                    </p>
                    
                    <!-- Benefits Box -->
                    <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 0 0 25px;">
                      <h2 style="margin: 0 0 15px; font-size: 18px; color: #065f46;">What's Next?</h2>
                      <ul style="margin: 0; padding-left: 20px; color: #065f46;">
                        <li style="margin-bottom: 10px; font-size: 14px;">Enjoy seamless shopping experience</li>
                        <li style="margin-bottom: 10px; font-size: 14px;">Receive email receipts for all your purchases</li>
                        <li style="margin-bottom: 10px; font-size: 14px;">Track your purchase history</li>
                        <li style="margin-bottom: 0; font-size: 14px;">Get exclusive offers and updates</li>
                      </ul>
                    </div>
                    
                    <!-- Contact Info -->
                    <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 0 0 25px;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Your registered phone number:</p>
                      <p style="margin: 0; font-size: 18px; color: #111827; font-weight: bold;">${phone}</p>
                    </div>
                    
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                      We look forward to serving you and providing you with the best shopping experience possible.
                    </p>
                    
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      If you have any questions or need assistance, please don't hesitate to contact us${storeInfo.phone ? ` at ${storeInfo.phone}` : ""}.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 16px; color: #374151; font-weight: bold;">
                      Thank you for choosing us!
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      This is an automated welcome message. Please do not reply to this email.
                    </p>
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
WELCOME!

Dear ${customerName},

Welcome to ${storeInfo.name}! We're thrilled to have you as our valued customer. Your account has been successfully created in our system.

WHAT'S NEXT?
• Enjoy seamless shopping experience
• Receive email receipts for all your purchases
• Track your purchase history
• Get exclusive offers and updates

Your registered phone number: ${phone}

We look forward to serving you and providing you with the best shopping experience possible.

If you have any questions or need assistance, please don't hesitate to contact us${storeInfo.phone ? ` at ${storeInfo.phone}` : ""}.

Thank you for choosing us!
${storeFooter}

---
This is an automated welcome message. Please do not reply to this email.
  `.trim();

	return { html, text };
}
