"use client";

import { useState, useRef } from "react";
import { BarcodeScanner, DetectedBarcode } from "react-barcode-scanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, Plus, Camera } from "lucide-react";
import { QR_SCANNER_FORMAT_OPTIONS, formatNaira } from "@/lib/utils";
import { InventoryItemWithCategory } from "@/lib/prisma-extended-types";

interface ProductSearchProps {
	inventory: InventoryItemWithCategory[];
	onAddToCart: (item: InventoryItemWithCategory, quantity: number) => void;
	creatingSale: boolean;
	completingSale: boolean;
}

export function ProductSearch({
	inventory,
	onAddToCart,
	creatingSale,
	completingSale,
}: ProductSearchProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isScanning, setIsScanning] = useState(false);
	const scannerRef = useRef(null);

	const filteredProducts = inventory.filter((item: any) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" || item.category?.name === selectedCategory;

		return matchesSearch && matchesCategory && item.stock > 0;
	});

	const categories = Array.from(
		new Set(inventory.map((item: any) => item.category?.name).filter(Boolean)),
	) as string[];

	const getStockStatus = (stock: number) => {
		if (stock === 0)
			return { label: "Out of Stock", variant: "destructive" as const };
		if (stock < 10)
			return { label: "Low Stock", variant: "secondary" as const };
		return { label: "In Stock", variant: "default" as const };
	};

	const handleScan = (decodedBarcodes: DetectedBarcode[]) => {
		setSearchTerm(decodedBarcodes[0].rawValue);
	};

	return (
		<div className='space-y-4 h-fit'>
			<div className='flex gap-4'>
				<div className='relative flex-1'>
					<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search products by name, SKU, or barcode...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='pl-8   focus:border-brand-main-400'
						disabled={completingSale || creatingSale}
					/>
					<Button
						type='button'
						variant='outline'
						onClick={() => setIsScanning(!isScanning)}
						disabled={completingSale || creatingSale}
						className='absolute right-2.5 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0   text-brand-main-700 hover:bg-brand-main-50'
						aria-label='Scan Barcode'>
						<Camera className='h-4 w-4' />
					</Button>
				</div>
				<Select
					value={selectedCategory}
					disabled={completingSale || creatingSale}
					onValueChange={setSelectedCategory}>
					<SelectTrigger className='w-44 focus:border-brand-main-400'>
						<SelectValue placeholder='All Categories' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Categories</SelectItem>
						{categories.map((category) => (
							<SelectItem
								key={category}
								value={category}>
								{category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{isScanning && (
				<div className='relative w-full h-64 border   rounded-lg overflow-hidden'>
					<BarcodeScanner
						ref={scannerRef}
						onCapture={handleScan}
						width={300}
						height={200}
						trackConstraints={{
							facingMode: {
								ideal: "environment",
							},
						}}
						options={{
							formats: QR_SCANNER_FORMAT_OPTIONS,
						}}
					/>
				</div>
			)}

			<div className='border   rounded-lg h-full max-h-[415px] overflow-y-auto'>
				<Table>
					<TableHeader>
						<TableRow className=' '>
							<TableHead className='text-brand-main-900'>Product</TableHead>
							<TableHead className='text-brand-main-900'>SKU</TableHead>
							<TableHead className='text-brand-main-900'>Price</TableHead>
							<TableHead className='text-brand-main-900'>Stock</TableHead>
							<TableHead className='text-brand-main-900'>Status</TableHead>
							<TableHead className='text-brand-main-900'>Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProducts.map((product) => {
							const stockStatus = getStockStatus(product.stock);
							return (
								<TableRow
									key={product.id}
									className='border-brand-main-100 hover:bg-brand-main-50'>
									<TableCell>
										<div>
											<p className='font-medium text-brand-main-900 text-sm'>
												{product.name}
											</p>
											{product.description && (
												<p className='text-xs text-slate-500 truncate max-w-xs'>
													{product.description}
												</p>
											)}
										</div>
									</TableCell>
									<TableCell className='text-brand-main-900 text-sm'>
										{product.sku}
									</TableCell>
									<TableCell className='text-brand-main-900 font-mono font-medium'>
										{formatNaira(Number(product.price))}
									</TableCell>
									<TableCell className='text-brand-main-900'>
										{product.stock}
									</TableCell>
									<TableCell>
										<Badge
											variant={stockStatus.variant}
											className={
												stockStatus.variant === "destructive"
													? "bg-red-100 text-red-900 hover:bg-red-100"
													: stockStatus.variant === "secondary"
													? "bg-amber-100 text-amber-900 hover:bg-amber-100"
													: "bg-green-100 text-green-900 hover:bg-green-100"
											}>
											{stockStatus.label}
										</Badge>
									</TableCell>
									<TableCell>
										<Button
											size='sm'
											onClick={() => onAddToCart(product, 1)}
											className='bg-brand-main-900 hover:bg-brand-main-700 text-white'
											disabled={
												product.stock === 0 || completingSale || creatingSale
											}>
											<Plus className='h-3 w-3 mr-1' />
											Add
										</Button>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>

			{filteredProducts.length === 0 && (
				<div className='text-center py-8 text-brand-main-600'>
					{searchTerm || selectedCategory !== "all"
						? "No products found matching your search criteria."
						: "No products available."}
				</div>
			)}
		</div>
	);
}
