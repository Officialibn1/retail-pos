"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	SortingState,
	getSortedRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { cn, downloadComponentAsPDF } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Download,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	tableName?: string;
	onRowClick?: (row: TData) => void;
}

const DataTable = <TData, TValue>({
	columns,
	data,
	tableName,
	onRowClick,
}: DataTableProps<TData, TValue>) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [isDownloading, setIsdownlaoding] = useState(false);

	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
		},
	});

	useEffect(() => {
		table.setPageSize(50);
	}, []);

	const handleDownloadTable = async () => {
		setIsdownlaoding((prev) => !prev);

		try {
			await downloadComponentAsPDF(
				tableRef,
				tableName ? tableName : "Report Table",
			);

			toast.success("Saved table to PNG successfully");
		} catch (error) {
			console.log("Error downloading table: ", error);
			toast.error("Failed to save table to PNG");
		} finally {
			setIsdownlaoding((prev) => !prev);
		}
	};

	const tableRef = useRef<HTMLTableElement>(null);

	return (
		<div className='flex flex-col gap-8 overflow-auto h-full'>
			<div className='flex items-center md:justify-between gap-6 flex-wrap'>
				<h1 className='text-sm text-nowrap'>
					<span className='font-medium'>Total Rows:</span> {table.getRowCount()}
				</h1>
				<div className='flex items-center gap-6 flex-wrap'>
					<div className='flex items-center gap-2'>
						<p className='text-sm font-medium'>Rows</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}>
							<SelectTrigger className='h-8 w-[100px]'>
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side='top'>
								{[50, 100, 200, 300].map((pageSize) => (
									<SelectItem
										key={pageSize}
										value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='flex w-[100px] items-center text-sm font-medium'>
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
					<div className='flex items-center space-x-2'>
						<Button
							variant='outline'
							size='icon'
							className='size-8 lg:flex'
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}>
							<span className='sr-only'>Go to first page</span>
							<ChevronsLeft />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='size-8'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}>
							<span className='sr-only'>Go to previous page</span>
							<ChevronLeft />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='size-8'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}>
							<span className='sr-only'>Go to next page</span>
							<ChevronRight />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='size-8 lg:flex'
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}>
							<span className='sr-only'>Go to last page</span>
							<ChevronsRight />
						</Button>
					</div>

					{/* <Button
						variant={"outline"}
						disabled={isDownloading}
						onClick={() => handleDownloadTable()}>
						{isDownloading ? <Spinner /> : <Download />} Download Table
					</Button> */}
				</div>
			</div>

			<div
				data-slot='table-container'
				className='relative w-full overflow-x-auto'>
				<div className='bg-white min-w-full'>
					<Table
						className='relative w-full bg-white min-w-[800px]'
						ref={tableRef}>
						<TableHeader className='rounded-lg'>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow
									key={headerGroup.id}
									className='h-9 bg-brand-main-200/60 hover:bg-brand-main-200/60 border-brand-main-400'>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead
												key={header.id + Math.random()}
												colSpan={header.colSpan}
												className='text-brand-main-900 font-semibold text-xs border border-brand-main-900/20 '>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>

						<TableBody>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row, rowIndex) => (
									<TableRow
										key={row.id + rowIndex}
										onClick={() => onRowClick?.(row.original)}
										className={cn(
											"hover:bg-brand-main-100/50 h-9 border border-brand-main-900/20 text-xs border-x",
											{
												"bg-brand-main-100/20": rowIndex % 2 === 0,
												"cursor-pointer": onRowClick,
											},
										)}>
										{row.getVisibleCells().map((cell, cellIndex) => (
											<TableCell
												key={`Mails-Files-Cell-${
													cellIndex * rowIndex
												}-${Math.random()}`}
												className='text-xs border-brand-main-900/20 border'>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length}>
										<h1 className='text-2xl text-center'>No records found</h1>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
};

export default DataTable;
