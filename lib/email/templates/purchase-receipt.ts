// Purchase receipt email template

import { PurchaseEmailData } from "../types";
import {
	getStoreInfo,
	generateStoreHeader,
	generateStoreFooterText,
} from "../store-info";

export function generatePurchaseReceiptEmail(data: PurchaseEmailData): {
	html: string;
	text: string;
} {
	const {
		customerName,
		saleId,
		items,
		subtotal,
		discount,
		tax,
		total,
		paymentMethod,
		date,
	} = data;
	const storeInfo = getStoreInfo();
	const storeHeader = generateStoreHeader(storeInfo);
	const storeFooter = generateStoreFooterText(storeInfo);

	const formattedDate = new Date(date).toLocaleString("en-NG", {
		dateStyle: "medium",
		timeStyle: "short",
	});

	const formatCurrency = (amount: number) =>
		`₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

	const itemsHtml = items
		.map(
			(item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">${formatCurrency(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;"><strong>${formatCurrency(item.total)}</strong></td>
    </tr>
  `,
		)
		.join("");

	const itemsText = items
		.map(
			(item) =>
				`${item.name} x${item.quantity} @ ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`,
		)
		.join("\n");

	const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Receipt</title>
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
                  <td style="background: linear-gradient(135deg, ${storeInfo.colors.primary} 0%, ${storeInfo.colors.secondary} 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 28px;">Thank You for Your Purchase!</h1>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Receipt #${saleId}</p>
                  </td>
                </tr>
                
                <!-- Customer Info -->
                <tr>
                  <td style="padding: 30px 30px 20px;">
                    <p style="margin: 0 0 10px; font-size: 16px; color: #374151;">
                      Dear <strong>${customerName}</strong>,
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      Thank you for shopping with us! Here's your receipt for your recent purchase.
                    </p>
                  </td>
                </tr>
                
                <!-- Order Details -->
                <tr>
                  <td style="padding: 0 30px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                      <tr style="background-color: #f9fafb;">
                        <td style="padding: 12px; font-weight: bold; color: #111827; border-bottom: 2px solid #e5e7eb;">Item</td>
                        <td style="padding: 12px; font-weight: bold; color: #111827; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</td>
                        <td style="padding: 12px; font-weight: bold; color: #111827; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</td>
                        <td style="padding: 12px; font-weight: bold; color: #111827; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</td>
                      </tr>
                      ${itemsHtml}
                    </table>
                  </td>
                </tr>
                
                <!-- Totals -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; text-align: right; color: #6b7280;">Subtotal:</td>
                        <td style="padding: 8px 0 8px 20px; text-align: right; color: #374151; width: 120px;">${formatCurrency(subtotal)}</td>
                      </tr>
                      ${
												discount > 0
													? `
                      <tr>
                        <td style="padding: 8px 0; text-align: right; color: #10b981;">Discount:</td>
                        <td style="padding: 8px 0 8px 20px; text-align: right; color: #10b981;">-${formatCurrency(discount)}</td>
                      </tr>
                      `
													: ""
											}
                      <tr>
                        <td style="padding: 8px 0; text-align: right; color: #6b7280;">Tax:</td>
                        <td style="padding: 8px 0 8px 20px; text-align: right; color: #374151;">${formatCurrency(tax)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #e5e7eb;">
                        <td style="padding: 12px 0 0; text-align: right; font-size: 18px; font-weight: bold; color: #111827;">Total:</td>
                        <td style="padding: 12px 0 0 20px; text-align: right; font-size: 18px; font-weight: bold; color: #667eea;">${formatCurrency(total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Payment Info -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 15px;">
                      <p style="margin: 0; font-size: 14px; color: #166534;">
                        <strong>Payment Method:</strong> ${paymentMethod}
                      </p>
                      <p style="margin: 8px 0 0; font-size: 14px; color: #166534;">
                        <strong>Date:</strong> ${formattedDate}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #374151;">
                      We appreciate your business!
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      This is an automated receipt. Please keep it for your records.
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
PURCHASE RECEIPT
Receipt #${saleId}

Dear ${customerName},

Thank you for shopping with us! Here's your receipt for your recent purchase.

ITEMS:
${itemsText}

Subtotal: ${formatCurrency(subtotal)}
${discount > 0 ? `Discount: -${formatCurrency(discount)}\n` : ""}Tax: ${formatCurrency(tax)}
-----------------------------------
TOTAL: ${formatCurrency(total)}

Payment Method: ${paymentMethod}
Date: ${formattedDate}

We appreciate your business!
${storeFooter}

---
This is an automated receipt. Please keep it for your records.
  `.trim();

	return { html, text };
}
