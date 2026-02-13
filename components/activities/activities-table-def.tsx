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
			cell: ({ row }) => <p className='text-xs'>{row.original.user.name}</p>,
		},
		{
			header: "Action",
			accessorKey: "action",
			cell: ({ row }) => <p className='text-xs'>{row.original.action}</p>,
		},
		{
			header: "Details",
			accessorKey: "details",
			cell: ({ row }) => {
				return (
					<div className='max-w-xs lg:max-w-md xl:max-w-3xl'>
						<p
							className='truncate text-xs'
							title={row.original.details}>
							{row.original.details}
						</p>
					</div>
				);
			},
		},
	];

	return tableDef;
};
