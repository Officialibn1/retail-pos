import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const QR_SCANNER_FORMAT_OPTIONS = [
	"code_128",
	"code_39",
	"code_93",
	"codabar",
	"ean_13",
	"ean_8",
	"itf",
	"qr_code",
	"upc_a",
	"upc_e",
] as string[];

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "decimal",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
}

export function formatNaira(amount: number): string {
	return `₦${formatCurrency(amount)}`;
}
