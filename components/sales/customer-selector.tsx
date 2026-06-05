"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, User, Plus, X, Phone, Mail } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
	setCustomer,
	clearCustomer,
	selectCartCustomer,
} from "@/lib/store/slices/cartSlice";
import {
	useGetCustomersQuery,
	useCreateCustomerMutation,
} from "@/lib/store/api";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { CustomerInput } from "@/lib/validations/customer.schema";
import { useDebounce } from "@/hooks/use-debounce";

interface CustomerSelectorProps {
	disabled?: boolean;
}

export function CustomerSelector({ disabled = false }: CustomerSelectorProps) {
	const dispatch = useAppDispatch();
	const selectedCustomer = useAppSelector(selectCartCustomer);

	const [searchTerm, setSearchTerm] = useState("");
	const [showAddDialog, setShowAddDialog] = useState(false);
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// RTK Query hooks
	const {
		data: customersData,
		isLoading,
		isFetching,
	} = useGetCustomersQuery({
		searchTerm: debouncedSearchTerm || undefined,
	});

	const [createCustomer, { isLoading: isCreating }] =
		useCreateCustomerMutation();

	const customers = customersData?.customers || [];

	const handleSelectCustomer = (customerId: string) => {
		if (disabled) return;

		const customer = customers.find((c) => c.id === customerId);
		if (customer) {
			dispatch(setCustomer(customer));
			setSearchTerm(""); // Clear search after selection
		}
	};

	const handleClearCustomer = () => {
		if (disabled) return;

		dispatch(clearCustomer());
		setSearchTerm("");
	};

	const handleAddCustomer = async (data: CustomerInput) => {
		if (disabled) return;

		try {
			const result = await createCustomer(data).unwrap();
			dispatch(setCustomer(result.customer));
			setShowAddDialog(false);
			setSearchTerm("");
		} catch (error) {
			console.error("Failed to create customer:", error);
			// Error handling is done in the dialog component
		}
	};

	return (
		<>
			<Card className='  h-fit'>
				<CardHeader className=''>
					<CardTitle className='text-brand-main-800 flex items-center gap-2'>
						<User className='h-5 w-5' />
						Customer
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2'>
					{selectedCustomer ? (
						// Selected customer display
						<div className='space-y-3'>
							<div className='flex items-start justify-between'>
								<div className='space-y-1'>
									<div className='flex items-center gap-2'>
										<h3 className='font-medium text-brand-main-800'>
											{selectedCustomer.name || "Anonymous Customer"}
										</h3>
										<Badge
											variant='secondary'
											className='text-xs'>
											Selected
										</Badge>
									</div>
									<div className='space-y-1 text-sm text-brand-main-600'>
										{selectedCustomer.phone && (
											<div className='flex items-center gap-1'>
												<Phone className='h-3 w-3' />
												{selectedCustomer.phone}
											</div>
										)}
										{selectedCustomer.email && (
											<div className='flex items-center gap-1'>
												<Mail className='h-3 w-3' />
												{selectedCustomer.email}
											</div>
										)}
									</div>
								</div>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleClearCustomer}
									disabled={disabled}
									className='text-brand-main-600 hover:text-brand-main-800 disabled:opacity-50 disabled:cursor-not-allowed'>
									<X className='h-4 w-4' />
								</Button>
							</div>
						</div>
					) : (
						// Customer selection interface
						<div className='space-y-3'>
							<div className='relative'>
								{isFetching ? (
									<Spinner className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
								) : (
									<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-brand-main-500' />
								)}
								<Input
									placeholder='Filter customers by name or phone...'
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									disabled={disabled}
									className='pl-8   focus:border-brand-main-400 disabled:opacity-50 disabled:cursor-not-allowed'
								/>
							</div>

							{/* Customer search results */}
							<div className='space-y-2'>
								{isLoading ? (
									<div className='flex items-center justify-center py-4'>
										<Spinner className='h-4 w-4' />
									</div>
								) : customers.length > 0 ? (
									<div className='space-y-2 max-h-48 overflow-y-auto'>
										{customers.map((customer) => (
											<div
												key={customer.id}
												onClick={() =>
													!disabled && handleSelectCustomer(customer.id)
												}
												onKeyDown={(e) => {
													if (
														!disabled &&
														(e.key === "Enter" || e.key === " ")
													) {
														e.preventDefault();
														handleSelectCustomer(customer.id);
													}
												}}
												tabIndex={disabled ? -1 : 0}
												role='button'
												aria-label={`Select customer ${
													customer.name || "Anonymous"
												}`}
												aria-disabled={disabled}
												className={`py-1 px-3 border   rounded-lg transition-colors ${
													disabled
														? "opacity-50 cursor-not-allowed"
														: "cursor-pointer hover:bg-brand-main-50 hover:border-brand-main-300 focus:bg-brand-main-50 focus:border-brand-main-400 focus:outline-none"
												}`}>
												<div className='flex flex-col'>
													<span className='font-medium text-brand-main-800'>
														{customer.name || "Anonymous Customer"}
													</span>
													<span className='text-xs text-muted-foreground'>
														{customer.phone}
														{customer.email && ` • ${customer.email}`}
													</span>
												</div>
											</div>
										))}
									</div>
								) : searchTerm ? (
									<p className='text-sm text-brand-main-600 text-center py-2'>
										No customers found for "{searchTerm}"
									</p>
								) : (
									<p className='text-sm text-brand-main-500 text-center py-2'>
										No customers available
									</p>
								)}
							</div>

							{/* Add new customer button */}
							<Button
								variant='outline'
								onClick={() => !disabled && setShowAddDialog(true)}
								disabled={disabled}
								className='w-full   text-brand-main-700 hover:bg-brand-main-50 disabled:opacity-50 disabled:cursor-not-allowed'>
								<Plus className='h-4 w-4 mr-2' />
								Add New Customer
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Customer Dialog */}
			<AddCustomerDialog
				open={showAddDialog && !disabled}
				onOpenChange={(open) => !disabled && setShowAddDialog(open)}
				onSave={handleAddCustomer}
				isCreating={isCreating}
			/>
		</>
	);
}
