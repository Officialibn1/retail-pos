import { UserWithoutPassword } from "@/lib/prisma-extended-types";
import { ColumnDef } from "@tanstack/react-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface UsersTableDefProps {
	onEdit: (user: UserWithoutPassword) => void;
	onDelete: (userId: string) => void;
}

export const usersTableDef = ({
	onEdit,
	onDelete,
}: UsersTableDefProps): ColumnDef<UserWithoutPassword>[] => {
	const tableDef: ColumnDef<UserWithoutPassword>[] = [
		{
			header: "Name",
			accessorKey: "name",
		},
		{
			header: "Email",
			accessorKey: "email",
		},
		{
			header: "Username",
			accessorKey: "username",
		},
		{
			header: "Role",
			accessorKey: "roles",
			cell: ({ row }) => {
				const roles = row.original.roles;
				// Display the highest role (first in array)
				const primaryRole = roles[0];

				// Color coding: SUPERADMIN: red, MANAGER: blue, CASHIER: brand-main
				let badgeClass = "";
				if (primaryRole === "SUPERADMIN") {
					badgeClass = "bg-red-100 text-red-800 hover:bg-red-100";
				} else if (primaryRole === "MANAGER") {
					badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-100";
				} else if (primaryRole === "CASHIER") {
					badgeClass =
						"bg-brand-main-100 text-brand-main-800 hover:bg-brand-main-100";
				} else if (primaryRole === "ADMIN") {
					badgeClass = "bg-purple-100 text-purple-800 hover:bg-purple-100";
				}

				return <Badge className={badgeClass}>{primaryRole}</Badge>;
			},
		},
		{
			header: "Shift",
			accessorKey: "shift",
			cell: ({ row }) => {
				const shift = row.original.shift;

				// Color coding: MORNING: orange, EVENING: purple, FULLTIME: blue
				let badgeClass = "";
				if (shift === "MORNING") {
					badgeClass = "bg-orange-100 text-orange-800 hover:bg-orange-100";
				} else if (shift === "EVENING") {
					badgeClass = "bg-purple-100 text-purple-800 hover:bg-purple-100";
				} else if (shift === "FULLTIME") {
					badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-100";
				}

				return <Badge className={badgeClass}>{shift}</Badge>;
			},
		},
		{
			header: "Created",
			accessorKey: "createdAt",
			cell: ({ row }) => {
				const date = row.original.createdAt;
				return new Date(date).toLocaleDateString();
			},
		},
		{
			header: "Actions",
			accessorKey: "id",
			cell: ({ row }) => {
				const user = row.original;

				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button
								variant='ghost'
								size='sm'
								className='text-brand-main-600 hover:bg-brand-main-100'
								aria-label={`Actions for ${user.name}`}>
								<MoreHorizontal className='h-4 w-4' />
								<span className='sr-only'>Open actions menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem
								onClick={() => onEdit(user)}
								className='text-brand-main-700'>
								<Edit
									className='h-4 w-4 mr-2'
									aria-hidden='true'
								/>
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDelete(user.id)}
								className='text-red-600 focus:text-red-600'>
								<Trash2
									className='h-4 w-4 mr-2'
									aria-hidden='true'
								/>
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	return tableDef;
};
