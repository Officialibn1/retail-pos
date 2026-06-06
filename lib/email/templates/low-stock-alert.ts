// Low-stock alert email template

import { getStoreInfo } from "../store-info";
import { LowStockAlertEmailData } from "../types";

export async function generateLowStockAlertEmail(
	data: LowStockAlertEmailData,
): Promise<{ html: string; text: string }> {
	const { items } = data;
	const store = await getStoreInfo();

	const formattedDate = new Date().toLocaleString("en-NG", {
		dateStyle: "full",
		timeStyle: "short",
	});

	const outOfStock = items.filter((i) => i.stock === 0);
	const lowStock = items.filter((i) => i.stock > 0);

	const formatCurrency = (amount: number) =>
		`₦${amount.toLocaleString("en-NG", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const renderRows = (
		rows: LowStockAlertEmailData["items"],
		labelColor: string,
	) =>
		rows
			.map(
				(item) => `
		<tr>
			<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.name}</td>
			<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">${item.sku}</td>
			<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">${item.category}</td>
			<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
				<span style="font-weight: bold; color: ${labelColor};">${item.stock}</span>
			</td>
			<td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">${item.reorderLevel}</td>
		</tr>`,
			)
			.join("");

	const outOfStockSection =
		outOfStock.length > 0
			? `
		<h2 style="margin: 25px 0 10px; font-size: 17px; color: #991b1b;">
			🔴 Out of Stock (${outOfStock.length})
		</h2>
		<table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fecaca; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
			<tr style="background-color: #fef2f2;">
				<td style="padding: 10px 12px; font-weight: bold; color: #991b1b; border-bottom: 2px solid #fecaca;">Product</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #991b1b; border-bottom: 2px solid #fecaca;">SKU</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #991b1b; border-bottom: 2px solid #fecaca;">Category</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #991b1b; border-bottom: 2px solid #fecaca; text-align: center;">Stock</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #991b1b; border-bottom: 2px solid #fecaca; text-align: center;">Reorder At</td>
			</tr>
			${renderRows(outOfStock, "#dc2626")}
		</table>`
			: "";

	const lowStockSection =
		lowStock.length > 0
			? `
		<h2 style="margin: 25px 0 10px; font-size: 17px; color: #92400e;">
			🟡 Low Stock (${lowStock.length})
		</h2>
		<table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #fde68a; border-radius: 6px; overflow: hidden; margin-bottom: 20px;">
			<tr style="background-color: #fffbeb;">
				<td style="padding: 10px 12px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fde68a;">Product</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fde68a;">SKU</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fde68a;">Category</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fde68a; text-align: center;">Stock</td>
				<td style="padding: 10px 12px; font-weight: bold; color: #92400e; border-bottom: 2px solid #fde68a; text-align: center;">Reorder At</td>
			</tr>
			${renderRows(lowStock, "#d97706")}
		</table>`
			: "";

	const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Stock Alert</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
      <tr>
        <td align="center">
          <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background-color: #d97706; padding: 28px 30px; text-align: center;">
                <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 22px;">⚠️ Low Stock Alert</h1>
                <p style="margin: 0; color: #fef3c7; font-size: 13px;">${formattedDate}</p>
              </td>
            </tr>

            <!-- Summary Banner -->
            <tr>
              <td style="padding: 24px 30px 0;">
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 16px 20px;">
                  <p style="margin: 0; font-size: 15px; color: #92400e;">
                    <strong>${items.length} item${items.length !== 1 ? "s" : ""}</strong> in your inventory 
                    ${outOfStock.length > 0 ? `require immediate attention — <strong>${outOfStock.length}</strong> are completely out of stock.` : "are running low and need restocking."}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Item Tables -->
            <tr>
              <td style="padding: 10px 30px 24px;">
                ${outOfStockSection}
                ${lowStockSection}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 6px; font-size: 13px; color: #6b7280;">
                  This alert was triggered automatically when a sale reduced stock to or below the reorder level.
                </p>
                <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e5e7eb; text-align: center;">
                  <p style="margin: 4px 0; font-size: 12px; color: #6b7280;"><strong>${store.name}</strong></p>
                  ${store.address ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">${store.address}</p>` : ""}
                  ${store.phone ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Phone: ${store.phone}</p>` : ""}
                  ${store.email ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Email: ${store.email}</p>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

	const itemsText = items
		.map(
			(i) =>
				`${i.stock === 0 ? "[OUT OF STOCK]" : "[LOW STOCK]"} ${i.name} (SKU: ${i.sku}) — ${i.stock} left, reorder at ≤${i.reorderLevel} — Category: ${i.category}`,
		)
		.join("\n");

	const text = `
LOW STOCK ALERT — ${store.name}
${formattedDate}

${items.length} item(s) need attention:

${itemsText}

---
This alert was triggered automatically when a sale reduced stock to or below the reorder level.

${store.name}
${store.address || ""}
${store.phone ? `Phone: ${store.phone}` : ""}
${store.email ? `Email: ${store.email}` : ""}
`.trim();

	return { html, text };
}
