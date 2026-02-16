// Store information utility for email templates

export interface StoreInfo {
	name: string;
	address: string;
	phone: string;
	logo: string;
}

/**
 * Get store information from environment variables
 * @returns Store information with defaults
 */
export function getStoreInfo(): StoreInfo {
	return {
		name: process.env.NEXT_PUBLIC_STORE_NAME || "POS Store",
		address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
		phone: process.env.NEXT_PUBLIC_STORE_PHONE || "",
		logo: process.env.NEXT_PUBLIC_STORE_LOGO || "/pos_logo.png",
	};
}

/**
 * Generate store header HTML for email templates
 * @param storeInfo - Store information
 * @returns HTML string for store header
 */
export function generateStoreHeader(storeInfo: StoreInfo): string {
	return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <img src="${storeInfo.logo}" alt="${storeInfo.name}" style="max-width: 150px; height: auto; display: block; margin: 0 auto;" />
        </td>
      </tr>
      <tr>
        <td align="center">
          <h2 style="margin: 10px 0 5px; font-size: 20px; color: #111827;">${storeInfo.name}</h2>
          ${storeInfo.address ? `<p style="margin: 5px 0; font-size: 13px; color: #6b7280;">${storeInfo.address}</p>` : ""}
          ${storeInfo.phone ? `<p style="margin: 5px 0; font-size: 13px; color: #6b7280;">Tel: ${storeInfo.phone}</p>` : ""}
        </td>
      </tr>
    </table>
  `;
}

/**
 * Generate store footer text for plain text emails
 * @param storeInfo - Store information
 * @returns Plain text string for store footer
 */
export function generateStoreFooterText(storeInfo: StoreInfo): string {
	let footer = `\n---\n${storeInfo.name}`;
	if (storeInfo.address) {
		footer += `\n${storeInfo.address}`;
	}
	if (storeInfo.phone) {
		footer += `\nTel: ${storeInfo.phone}`;
	}
	return footer;
}
