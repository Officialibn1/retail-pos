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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { UserRole } from "@/lib/types";
import { CategoryWithCount } from "@/lib/services/category.service";

interface CategoriesTableProps {
	categories: CategoryWithCount[];
	onEdit: (category: CategoryWithCount) => void;
	onDelete: (category: CategoryWithCount) => void;
	isFetching: boolean;
}

export function CategoriesTable({
	categories,
	onEdit,
	onDelete,
	isFetching,
}: CategoriesTableProps) {
	const { user } = useAuth();

	const canModify = user?.roles.some((role) =>
		(
			[UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER] as UserRole[]
		).includes(role),
	);

	return (
		<div
			role='region'
			aria-label='Categories table'
			className='mt-3'
			aria-live='polite'
			aria-busy={isFetching}>
			<Table>
				<TableHeader>
					<TableRow className='border-brand-main-200'>
						<TableHead className='text-brand-main-700'>Name</TableHead>
						<TableHead className='text-brand-main-700'>Item Count</TableHead>
						<TableHead className='text-brand-main-700'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{categories.map((category) => (
						<TableRow
							key={category.id}
							className='border-brand-main-100'>
							<TableCell>
								<div className='font-medium text-brand-main-800'>
									{category.name}
								</div>
							</TableCell>
							<TableCell className='text-brand-main-700'>
								{category._count.inventoryItems}
							</TableCell>
							<TableCell>
								{canModify ? (
									<DropdownMenu>
										<DropdownMenuTrigger>
											<Button
												variant='ghost'
												size='sm'
												className='text-brand-main-600 hover:bg-brand-main-100'
												aria-label={`Actions for ${category.name}`}>
												<MoreHorizontal className='h-4 w-4' />
												<span className='sr-only'>Open actions menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem
												onClick={() => onEdit(category)}
												className='text-brand-main-700'>
												<Edit
													className='h-4 w-4 mr-2'
													aria-hidden='true'
												/>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDelete(category)}
												className='text-red-600 focus:text-red-600'>
												<Trash2
													className='h-4 w-4 mr-2'
													aria-hidden='true'
												/>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<span className='text-sm text-brand-main-500'>
										No actions available
									</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{categories.length === 0 && (
				<div
					className='text-center py-8 text-brand-main-600'
					role='status'
					aria-live='polite'>
					No categories found matching your search criteria.
				</div>
			)}
		</div>
	);
}
