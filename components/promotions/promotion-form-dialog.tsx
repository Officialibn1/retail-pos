"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import {
  createPromotionSchema,
  type CreatePromotionInput,
} from "@/lib/validations/promotion.schema";
import { Promotion } from "@/generated/prisma";
import { useGetCategoriesQuery, useGetInventoryQuery } from "@/lib/store/api";
import { useCurrencySymbol } from "@/hooks/use-currency-symbol";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PromotionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: Promotion | null;
  onSave: (data: CreatePromotionInput) => void;
  isSaving: boolean;
}

export function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
  onSave,
  isSaving,
}: PromotionFormDialogProps) {
  const c = useCurrencySymbol();
  const isEditing = !!promotion;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: inventoryData } = useGetInventoryQuery();

  const categories = categoriesData?.categories || [];
  const inventoryItems = inventoryData || [];

  const form = useForm<CreatePromotionInput>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: 10,
      scope: "ALL",
      targetId: "",
      isActive: true,
      expiresAt: null,
      usageLimit: undefined,
    },
  });

  const watchScope = form.watch("scope");
  const watchType = form.watch("type");
  const watchExpiresAt = form.watch("expiresAt");

  // Parse the stored ISO string back to a Date for the Calendar
  const selectedDate = watchExpiresAt ? new Date(watchExpiresAt) : undefined;

  useEffect(() => {
    if (open && promotion) {
      form.reset({
        code: promotion.code,
        description: promotion.description || "",
        type: promotion.type,
        value: Number(promotion.value),
        scope: promotion.scope,
        targetId: promotion.targetId || "",
        isActive: promotion.isActive,
        expiresAt: promotion.expiresAt
          ? new Date(promotion.expiresAt).toISOString()
          : null,
        usageLimit: promotion.usageLimit ?? undefined,
      });
    }
    if (!open) {
      form.reset();
      setCalendarOpen(false);
    }
  }, [open, promotion]);

  const onSubmit = (data: CreatePromotionInput) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-brand-main-950">
            {isEditing ? "Edit Promotion" : "Create Promotion"}
          </DialogTitle>
          <DialogDescription className="text-brand-main-800">
            {isEditing
              ? "Update promotion details."
              : "Define a new discount promotion or coupon code."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Code — read-only when editing */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSaving || isEditing}
                      placeholder="e.g. SAVE20"
                      className="font-mono uppercase focus:border-brand-main-400"
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  {!isEditing && (
                    <p className="text-xs text-slate-500">
                      Uppercase letters, numbers, hyphens and underscores only.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={2}
                      disabled={isSaving}
                      placeholder="Optional — shown to staff when code is applied"
                      className="focus:border-brand-main-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger className="focus:border-brand-main-400 w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="FIXED">
                          Fixed Amount ({c})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "PERCENTAGE"
                        ? "Discount %"
                        : `Amount (${c})`}{" "}
                      *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step={watchType === "PERCENTAGE" ? "1" : "0.01"}
                        min={0}
                        max={watchType === "PERCENTAGE" ? 100 : undefined}
                        disabled={isSaving}
                        className="focus:border-brand-main-400"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value !== "" ? Number(e.target.value) : 0,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applies To *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      form.setValue("targetId", "");
                    }}
                    disabled={isSaving}>
                    <FormControl>
                      <SelectTrigger className="focus:border-brand-main-400 w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">All Items</SelectItem>
                      <SelectItem value="CATEGORY">
                        Specific Category
                      </SelectItem>
                      <SelectItem value="ITEM">Specific Product</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchScope === "CATEGORY" && (
              <FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Category *</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger className="focus:border-brand-main-400 w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchScope === "ITEM" && (
              <FormField
                control={form.control}
                name="targetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Product *</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isSaving}>
                      <FormControl>
                        <SelectTrigger className="focus:border-brand-main-400 w-full">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}{" "}
                            <span className="text-xs text-slate-400">
                              ({item.sku})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry date — shadcn Calendar picker */}
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At</FormLabel>
                    <div className="flex gap-1.5">
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}>
                        <PopoverTrigger
                          type="button"
                          disabled={isSaving}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "flex-1 justify-start text-left font-normal focus:border-brand-main-400",
                            !selectedDate && "text-muted-foreground",
                          )}>
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          {selectedDate
                            ? format(selectedDate, "dd MMM yyyy")
                            : "Pick a date"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              // Set to end of selected day in UTC
                              if (date) {
                                const eod = new Date(date);
                                eod.setHours(23, 59, 59, 999);
                                field.onChange(eod.toISOString());
                              } else {
                                field.onChange(null);
                              }
                              setCalendarOpen(false);
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {/* Clear button */}
                      {selectedDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={isSaving}
                          onClick={() => field.onChange(null)}
                          className="h-9 w-9 text-slate-400 hover:text-slate-600">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Leave empty for no expiry.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage Limit</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min={1}
                        disabled={isSaving}
                        placeholder="Unlimited"
                        className="focus:border-brand-main-400"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value !== ""
                              ? Number(e.target.value)
                              : null,
                          )
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-slate-500">
                      Number of times the coupon can be used.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Active
                    </FormLabel>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Inactive promotions cannot be applied at checkout.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => onOpenChange(false)}
                className="hover:bg-brand-main-50 flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-brand-main-900 hover:bg-brand-main-700 text-white flex-1">
                {isSaving ? (
                  <Spinner />
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Promotion"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
