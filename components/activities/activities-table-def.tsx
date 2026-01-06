import { ActivityLogWithUser } from "@/lib/prisma-extended-types";
import { ColumnDef } from "@tanstack/react-table";

export const activitiesTableDef = (): ColumnDef<ActivityLogWithUser>[] => {
	const tableDef: ColumnDef<ActivityLogWithUser>[] = [
		{
			header: "Timestamp",
			accessorKey: "createdAt",
			cell: ({ row }) => {
				const createdAt = row.original.createdAt;
				// Handle both string and Date types
				const date =
					typeof createdAt === "string" ? new Date(createdAt) : createdAt;

				// Format to display both date and time
				return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
			},
		},
		{
			header: "User",
			accessorKey: "user",
			cell: ({ row }) => {
				// Extract user name from nested user object
				return row.original.user.name;
			},
		},
		{
			header: "Action",
			accessorKey: "action",
		},
		{
			header: "Details",
			accessorKey: "details",
			cell: ({ row }) => {
				return <span className='truncate'>{row.original.details}</span>;
			},
		},
	];

	return tableDef;
};
