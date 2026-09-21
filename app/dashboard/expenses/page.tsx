"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Plus,
	Search,
	Receipt,
	TrendingDown,
	Loader2,
	CalendarDays,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserRole } from "@/lib/types";
import {
	useGetExpensesQuery,
	useCreateExpenseMutation,
	useUpdateExpenseMutation,
	useDeleteExpenseMutation,
} from "@/lib/store/api";
import { CreateExpenseInput, UpdateExpenseInput } from "@/lib/validations/expense.schema";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/validations/expense.schema";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { EditExpenseDialog } from "@/components/expenses/edit-expense-dialog";
import { expenseTableDef } from "@/components/expenses/expense-table-def";
import DataTable from "@/components/dashboard/data-table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { formatNaira } from "@/lib/utils";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { ExpenseRecord } from "@/lib/types";

export default function ExpensesPage() {
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");

	const [debouncedSearch] = useDebounce(searchTerm, 300);
	const c = useCurrencySymbol();

	const {
		data,
		isLoading,
		isFetching,
		isError,
		error: queryError,
	} = useGetExpensesQuery({
		searchTerm: debouncedSearch || undefined,
		category: categoryFilter !== "all" ? categoryFilter : undefined,
	});

	const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
	const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
	const [deleteExpense] = useDeleteExpenseMutation();

	const expenses = data?.expenses ?? [];

	// Summary stats
	const totalExpenses = expenses.reduce(
		(sum, e) => sum + Number(e.amount),
		0,
	);
	const thisMonthExpenses = expenses
		.filter((e) => {
			const d = new Date(e.date);
			const now = new Date();
			return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
		})
		.reduce((sum, e) => sum + Number(e.amount), 0);

	const categoryTotals = EXPENSE_CATEGORIES.reduce(
		(acc, cat) => {
			acc[cat] = expenses
				.filter((e) => e.category === cat)
				.reduce((sum, e) => sum + Number(e.amount), 0);
			return acc;
		},
		{} as Record<string, number>,
	);

	const topCategory = Object.entries(categoryTotals).sort(
		([, a], [, b]) => b - a,
	)[0];

	// Handlers
	const handleAddExpense = async (data: CreateExpenseInput, form: any) => {
		try {
			await createExpense(data).unwrap();
			form.reset();
			setShowAddDialog(false);
			toast.success("Expense recorded successfully");
		} catch (err: any) {
			toast.error(
				err.data?.error?.message || err.message || "Failed to record expense",
			);
		}
	};

	const handleEditExpense = (expense: ExpenseRecord) => {
		setSelectedExpense(expense);
		setShowEditDialog(true);
	};

	const handleSaveEdit = async (id: string, data: UpdateExpenseInput) => {
		try {
			await updateExpense({ id, data }).unwrap();
			setShowEditDialog(false);
			setSelectedExpense(null);
			toast.success("Expense updated successfully");
		} catch (err: any) {
			toast.error(
				err.data?.error?.message || err.message || "Failed to update expense",
			);
		}
	};

	const handleDeleteExpense = (expense: ExpenseRecord) => {
		setSelectedExpense(expense);
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		if (!selectedExpense) return;
		try {
			await deleteExpense(selectedExpense.id).unwrap();
			setShowDeleteDialog(false);
			setSelectedExpense(null);
			toast.success("Expense deleted successfully");
		} catch (err: any) {
			toast.error(
				err.data?.error?.message || err.message || "Failed to delete expense",
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-brand-main-600" />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			(queryError as any)?.data?.error?.message ||
			(queryError as any)?.message ||
			"Failed to load expenses";
		return (
			<div className="space-y-6 p-6">
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-800">Error Loading Expenses</CardTitle>
						<CardDescription className="text-red-700">{errorMessage}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
			<div className="space-y-6 p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-brand-main-950">
							Expense Tracking
						</h1>
						<p className="text-brand-main-800 mt-1">
							Record and monitor operational costs
						</p>
					</div>
					<Button
						onClick={() => setShowAddDialog(true)}
						className="bg-brand-main-900 hover:bg-brand-main-700 text-white"
					>
						<Plus className="h-4 w-4 mr-2" />
						Record Expense
					</Button>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Total Expenses (Filtered)
							</CardTitle>
							<Receipt className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{formatNaira(totalExpenses, c)}
							</div>
							<p className="text-xs text-slate-500">{expenses.length} records</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								This Month
							</CardTitle>
							<CalendarDays className="h-4 w-4 text-brand-main-600" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{formatNaira(thisMonthExpenses, c)}
							</div>
							<p className="text-xs text-slate-500">
								{new Date().toLocaleString("default", { month: "long", year: "numeric" })}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-slate-600">
								Top Category
							</CardTitle>
							<TrendingDown className="h-4 w-4 text-red-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand-main-800">
								{topCategory && topCategory[1] > 0
									? EXPENSE_CATEGORY_LABELS[topCategory[0] as keyof typeof EXPENSE_CATEGORY_LABELS]
									: "—"}
							</div>
							<p className="text-xs text-slate-500">
								{topCategory && topCategory[1] > 0
									? formatNaira(topCategory[1], c)
									: "No expenses yet"}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Table */}
				<Card>
					<CardHeader>
						<div className="flex gap-4 mt-2 flex-wrap">
							<div className="relative flex-1 min-w-[200px]">
								{isFetching ? (
									<Spinner className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								) : (
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								)}
								<Input
									placeholder="Search expenses..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8 focus:border-brand-main-400"
								/>
							</div>
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className="w-48 focus:border-brand-main-400">
									<SelectValue placeholder="All Categories" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{EXPENSE_CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{EXPENSE_CATEGORY_LABELS[cat]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						<DataTable
							columns={expenseTableDef({
								onEdit: handleEditExpense,
								onDelete: handleDeleteExpense,
								currencySymbol: c,
							})}
							data={expenses}
							tableName="Expenses"
						/>
					</CardContent>
				</Card>

				{/* Dialogs */}
				<AddExpenseDialog
					open={showAddDialog}
					onOpenChange={setShowAddDialog}
					onSave={handleAddExpense}
					isSaving={isCreating}
				/>

				<EditExpenseDialog
					open={showEditDialog}
					onOpenChange={setShowEditDialog}
					expense={selectedExpense}
					onSave={handleSaveEdit}
					isSaving={isUpdating}
				/>

				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="text-brand-main-800">
								Delete Expense
							</AlertDialogTitle>
							<AlertDialogDescription className="text-brand-main-600">
								Are you sure you want to delete "{selectedExpense?.title}"? This
								action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="text-brand-main-700 hover:bg-brand-main-50">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</ProtectedRoute>
	);
}
