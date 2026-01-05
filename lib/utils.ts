import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas-pro";
import jsPDF, { ImageOptions } from "jspdf";
import { DateStyle, TimeStyle } from "./types";

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

export const dateTimeFormatter = (
	date: Date | string,
	dateStyle: DateStyle = "medium",
	timeStyle: TimeStyle = "short",
	locales: string = "en-GB",
) => {
	const formatter = new Intl.DateTimeFormat(locales, {
		dateStyle,
		timeStyle,
	});

	return formatter.format(new Date(date));
};

export const downloadComponentAsPDF = async (
	component: React.RefObject<HTMLTableElement | HTMLDivElement | null>,
	name: string,
) => {
	if (!component.current) return;

	try {
		const canvas = await html2canvas(component.current, {
			scale: 4,
		});

		const dataUrl = canvas.toDataURL("image/png");

		const img = new Image();
		img.src = dataUrl;

		await new Promise<void>((resolve, reject) => {
			img.onload = () => {
				const pdf = new jsPDF({
					unit: "px",
					format: [img.height, img.width],
					compress: true,
					orientation: "l",
				});

				const options: ImageOptions = {
					imageData: dataUrl,
					format: "WEBP",
					x: img.width * 0.12,
					y: img.height * 0.15,
					width: img.scrollWidth,
					height: img.scrollHeight,
					compression: "FAST",
				};

				pdf.addImage(options);

				const filename = `${name}-${dateTimeFormatter(
					new Date(),
					"medium",
				)}.pdf`;
				pdf.save(filename);
				resolve();
			};
			img.onerror = reject;
		});
	} catch (error) {
		console.log(
			"Error Saving Component To PDF: ",
			JSON.stringify(error, null, 2),
		);
		return error;
	}
};

export const getStockStatus = (stock: number) => {
	if (stock === 0)
		return { label: "Out of Stock", variant: "destructive" as const };
	if (stock < 10) return { label: "Low Stock", variant: "secondary" as const };
	return { label: "In Stock", variant: "default" as const };
};
