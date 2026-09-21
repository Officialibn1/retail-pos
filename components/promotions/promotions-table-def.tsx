import { ColumnDef } from "@tanstack/react-table";
import { Promotion } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { format } from "date-fns";

interface TableDef {
  onEdit: (promo: Promotion) => void;
  onDelete: (promo: Promotion) => void;
  onToggleActive: (promo: Promotion) => void;
  currencySymbol?: string;
}

export const promotionsTableDef = ({
  onEdit,
  onDelete,
  onToggleActive,
  currencySymbol = "₦",
}: TableDef): ColumnDef<Promotion>[] => [
  {
    header: "Code",
    accessorKey: "code",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-brand-main-900 tracking-wider">
        {row.original.code}
      </span>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) =>
      row.original.description || <span className="text-slate-400">—</span>,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.type === "PERCENTAGE" ? "%" : currencySymbol}{" "}
        {row.original.type}
      </Badge>
    ),
  },
  {
    header: "Value",
    accessorKey: "value",
    cell: ({ row }) =>
      row.original.type === "PERCENTAGE"
        ? `${Number(row.original.value)}%`
        : `${currencySymbol}${Number(row.original.value).toLocaleString()}`,
  },
  {
    header: "Scope",
    accessorKey: "scope",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.original.scope}
      </Badge>
    ),
  },
  {
    header: "Usage",
    accessorKey: "usageCount",
    cell: ({ row }) => {
      const { usageCount, usageLimit } = row.original;
      return (
        <span className="text-slate-700 text-xs">
          {usageCount}
          {usageLimit !== null ? ` / ${usageLimit}` : ""}
        </span>
      );
    },
  },
  {
    header: "Expires",
    accessorKey: "expiresAt",
    cell: ({ row }) => {
      const d = row.original.expiresAt;
      if (!d) return <span className="text-slate-400 text-xs">Never</span>;
      const expired = new Date(d) < new Date();
      return (
        <span
          className={`text-xs ${expired ? "text-red-600" : "text-slate-700"}`}>
          {format(new Date(d), "dd MMM yyyy")}
          {expired && " (expired)"}
        </span>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge className="bg-green-100 text-green-800 text-xs border border-green-200">
          Active
        </Badge>
      ) : (
        <Badge className="bg-slate-100 text-slate-600 text-xs border border-slate-200">
          Inactive
        </Badge>
      ),
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: ({ row }) => {
      const promo = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-main-600 hover:bg-brand-main-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(promo)}
              className="text-brand-main-700">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleActive(promo)}
              className="text-brand-main-700">
              {promo.isActive ? (
                <ToggleLeft className="h-4 w-4 mr-2" />
              ) : (
                <ToggleRight className="h-4 w-4 mr-2" />
              )}
              {promo.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(promo)}
              className="text-red-600 focus:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
