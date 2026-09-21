"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tag, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { UserRole } from "@/lib/types";
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
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} from "@/lib/store/api";
import { Promotion } from "@/generated/prisma";
import { CreatePromotionInput } from "@/lib/validations/promotion.schema";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";
import { PromotionFormDialog } from "@/components/promotions/promotion-form-dialog";
import { promotionsTableDef } from "@/components/promotions/promotions-table-def";
import DataTable from "@/components/dashboard/data-table";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";

export default function PromotionsPage() {
  const c = useCurrencySymbol();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const {
    data: promosData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetPromotionsQuery({ searchTerm: debouncedSearch || undefined });

  const [createPromotion, { isLoading: isCreating }] =
    useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] =
    useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] =
    useDeletePromotionMutation();

  const promotions = promosData?.promotions || [];
  const activeCount = promotions.filter((p) => p.isActive).length;
  const expiredCount = promotions.filter(
    (p) => p.expiresAt && new Date(p.expiresAt) < new Date(),
  ).length;

  const handleCreate = () => {
    setSelectedPromo(null);
    setShowFormDialog(true);
  };

  const handleEdit = (promo: Promotion) => {
    setSelectedPromo(promo);
    setShowFormDialog(true);
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await updatePromotion({
        id: promo.id,
        data: { isActive: !promo.isActive },
      }).unwrap();
      toast.success(
        promo.isActive ? "Promotion deactivated" : "Promotion activated",
      );
    } catch (err: any) {
      toast.error(err.data?.error?.message || "Failed to update promotion");
    }
  };

  const handleSave = async (data: CreatePromotionInput) => {
    try {
      if (selectedPromo) {
        await updatePromotion({ id: selectedPromo.id, data }).unwrap();
        toast.success("Promotion updated");
      } else {
        await createPromotion(data).unwrap();
        toast.success("Promotion created");
      }
      setShowFormDialog(false);
      setSelectedPromo(null);
    } catch (err: any) {
      toast.error(err.data?.error?.message || "Failed to save promotion");
    }
  };

  const handleDelete = (promo: Promotion) => {
    setSelectedPromo(promo);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPromo) return;
    try {
      await deletePromotion(selectedPromo.id).unwrap();
      setShowDeleteDialog(false);
      setSelectedPromo(null);
      toast.success("Promotion deleted");
    } catch (err: any) {
      toast.error(err.data?.error?.message || "Failed to delete promotion");
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
    const msg =
      (error as any)?.data?.error?.message || "Failed to load promotions";
    return (
      <div className="space-y-6 p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <p className="text-red-700">{msg}</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const columns = promotionsTableDef({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onToggleActive: handleToggleActive,
    currencySymbol: c,
  });

  return (
    <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN, UserRole.MANAGER]}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-main-950">
              Promotions
            </h1>
            <p className="text-brand-main-800 mt-1">
              Create and manage discount codes
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-brand-main-900 hover:bg-brand-main-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Promotion
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Promotions
              </CardTitle>
              <Tag className="h-4 w-4 text-brand-main-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-main-800">
                {promosData?.count ?? 0}
              </div>
              <p className="text-xs text-slate-500">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Active
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-main-800">
                {activeCount}
              </div>
              <p className="text-xs text-slate-500">Currently usable</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Expired
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-main-800">
                {expiredCount}
              </div>
              <p className="text-xs text-slate-500">Past expiry date</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4 mt-2">
              <div className="relative flex-1">
                {isFetching ? (
                  <Spinner className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  placeholder="Search by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 focus:border-brand-main-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={promotions}
              tableName="Promotions"
            />
          </CardContent>
        </Card>

        <PromotionFormDialog
          open={showFormDialog}
          onOpenChange={setShowFormDialog}
          promotion={selectedPromo}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-brand-main-800">
                Delete Promotion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-brand-main-600">
                Are you sure you want to delete "{selectedPromo?.code}"? This
                action cannot be undone. Promotions used in sales cannot be
                deleted — deactivate instead.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-brand-main-700 hover:bg-brand-main-50">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Spinner className="h-4 w-4" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
