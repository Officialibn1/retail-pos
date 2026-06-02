import { getStoreSettings } from "@/lib/services/store-settings.service";

export interface StoreInfo {
	name: string;
	address: string;
	phone: string;
	email: string;
	logo: string;
	colors: {
		primary: string;
		secondary: string;
	};
}

export async function getStoreInfo(): Promise<StoreInfo> {
	const s = await getStoreSettings();
	return {
		name: s.name,
		address: s.address,
		phone: s.phone,
		email: s.email,
		logo: s.logoUrl,
		colors: { primary: s.primaryColor, secondary: s.secondaryColor },
	};
}

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

export function generateStoreFooterText(storeInfo: StoreInfo): string {
	let footer = `\n---\n${storeInfo.name}`;
	if (storeInfo.address) footer += `\n${storeInfo.address}`;
	if (storeInfo.phone) footer += `\nTel: ${storeInfo.phone}`;
	return footer;
}
