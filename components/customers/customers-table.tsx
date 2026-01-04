"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { CustomerWithSales } from "@/lib/store/api";
import { useAuth } from "@/components/auth/auth-provider";
import { UserRole } from "@/lib/types";

interface CustomersTableProps {
	customers: CustomerWithSales[];

	isFetching: boolean;
}

export function CustomersTable({
	customers,

	isFetching,
}: CustomersTableProps) {
	const { user } = useAuth();

	// Check if user can delete customers (MANAGER+ roles, not CASHIER)
	// Requirement 9.2: CASHIER role can create and read but not delete
	// Requirement 9.5: Conditionally render action buttons based on user role
	const canDelete = user?.roles.some((role) =>
		(
			[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]
		).includes(role),
	);

	return (
		<div
			role='region'
			aria-label='Customers table'
			aria-live='polite'
			aria-busy={isFetching}>
			<Table>
				<TableHeader>
					<TableRow className='border-brand-main-200'>
						<TableHead className='text-brand-main-700'>Name</TableHead>
						<TableHead className='text-brand-main-700'>Email</TableHead>
						<TableHead className='text-brand-main-700'>Phone</TableHead>
						<TableHead className='text-brand-main-700'>Total Sales</TableHead>
						<TableHead className='text-brand-main-700'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{customers.map((customer) => (
						<TableRow
							key={customer.id}
							className='border-brand-main-100'>
							<TableCell>
								<div className='font-medium text-brand-main-800'>
									{customer.name || "N/A"}
								</div>
							</TableCell>
							<TableCell className='text-brand-main-700'>
								{customer.email || "N/A"}
							</TableCell>
							<TableCell className='text-brand-main-700'>
								{customer.phone || "N/A"}
							</TableCell>
							<TableCell className='text-brand-main-700'>
								{customer.sales.length}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger>
										<Button
											variant='ghost'
											size='sm'
											className='text-brand-main-600 hover:bg-brand-main-100'
											aria-label={`Actions for ${
												customer.name ||
												customer.email ||
												customer.phone ||
												"customer"
											}`}>
											<MoreHorizontal className='h-4 w-4' />
											<span className='sr-only'>Open actions menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem className='text-brand-main-700'>
											<Edit
												className='h-4 w-4 mr-2'
												aria-hidden='true'
											/>
											Edit
										</DropdownMenuItem>
										{canDelete ? (
											<DropdownMenuItem className='text-red-600 focus:text-red-600'>
												<Trash2
													className='h-4 w-4 mr-2'
													aria-hidden='true'
												/>
												Delete
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												disabled
												className='text-brand-main-400'
												aria-label='Delete action restricted for your role'>
												<Trash2
													className='h-4 w-4 mr-2'
													aria-hidden='true'
												/>
												Delete (Restricted)
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{customers.length === 0 && (
				<div
					className='text-center py-8 text-brand-main-600'
					role='status'
					aria-live='polite'>
					No customers found matching your search criteria.
				</div>
			)}
		</div>
	);
}
