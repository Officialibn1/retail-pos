"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/validations/expense.schema";
import { ExpenseRecord } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
	RENT: "bg-blue-100 text-blue-800",
	SALARIES: "bg-purple-100 text-purple-800",
	UTILITIES: "bg-yellow-100 text-yellow-800",
	RESTOCKING: "bg-green-100 text-green-800",
	MAINTENANCE: "bg-orange-100 text-orange-800",
	MARKETING: "bg-pink-100 text-pink-800",
	OTHER: "bg-slate-100 text-slate-800",
};

interface ExpenseTableActions {
	onEdit: (expense: ExpenseRecord) => void;
	onDelete: (expense: ExpenseRecord) => void;
	currencySymbol: string;
}

export function expenseTableDef({
	onEdit,
	onDelete,
	currencySymbol,
}: ExpenseTableActions): ColumnDef<ExpenseRecord>[] {
	return [
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => (
				<span className="text-sm text-slate-700">
					{new Date(row.original.date).toLocaleDateString("en-NG", {
						day: "2-digit",
						month: "short",
						year: "numeric",
					})}
				</span>
			),
		},
		{
			accessorKey: "title",
			header: "Title",
			cell: ({ row }) => (
				<div>
					<p className="font-medium text-brand-main-900 text-sm">{row.original.title}</p>
					{row.original.description && (
						<p className="text-xs text-slate-500 truncate max-w-[200px]">
							{row.original.description}
						</p>
					)}
				</div>
			),
		},
		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => {
				const cat = row.original.category;
				return (
					<Badge
						variant="secondary"
						className={`text-xs font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.OTHER}`}
					>
						{EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat}
					</Badge>
				);
			},
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => (
				<span className="font-semibold text-brand-main-800">
					{formatNaira(Number(row.original.amount), currencySymbol)}
				</span>
			),
		},
		{
			accessorKey: "recordedBy",
			header: "Recorded By",
			cell: ({ row }) => (
				<span className="text-sm text-slate-600">{row.original.recordedBy.name}</span>
			),
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onEdit(row.original)}
						className="h-8 w-8 p-0 text-brand-main-700 hover:bg-brand-main-50"
						aria-label="Edit expense"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onDelete(row.original)}
						className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
						aria-label="Delete expense"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];
}
