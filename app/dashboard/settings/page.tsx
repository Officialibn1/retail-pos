"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/components/auth/auth-provider";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { BackupConfirmationDialog } from "@/components/settings/backup-confirmation-dialog";
import { Store, Shield, DatabaseBackup, User2, Download } from "lucide-react";
import {
	useGetStoreSettingsQuery,
	useUpdateStoreSettingsMutation,
} from "@/lib/store/api";
import { useToast } from "@/components/ui/use-toast";

// ─── Schema ───────────────────────────────────────────────────────────────────

const storeSettingsSchema = z.object({
	name: z.string().min(1, "Store name is required"),
	address: z.string(),
	phone: z.string(),
	email: z.string().refine(
		(v) => v === "" || z.string().email().safeParse(v).success,
		{ message: "Invalid email address" },
	),
	taxRate: z.string().refine(
		(v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100,
		{ message: "Must be a number between 0 and 100" },
	),
	logoUrl: z.string(),
	primaryColor: z.string(),
	secondaryColor: z.string(),
	currencySymbol: z.string().min(1, "Currency symbol is required").max(8),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

// ─── Inner form ────────────────────────────────────────────────────────────────

function StoreSettingsForm({
	defaultValues,
	isSuperAdmin,
	isManager,
}: {
	defaultValues: StoreSettingsFormValues;
	isSuperAdmin: boolean;
	isManager: boolean;
}) {
	const { toast } = useToast();
	const [updateSettings, { isLoading: isSaving }] =
		useUpdateStoreSettingsMutation();

	const canEdit = isSuperAdmin || isManager;

	const form = useForm<StoreSettingsFormValues>({
		resolver: zodResolver(storeSettingsSchema),
		defaultValues,
	});

	const onSubmit = async (values: StoreSettingsFormValues) => {
		try {
			// Build payload — MANAGERs can only update contact + currency fields
			const payload: Parameters<typeof updateSettings>[0] = {
				address: values.address,
				phone: values.phone,
				email: values.email,
				currencySymbol: values.currencySymbol,
			};

			if (isSuperAdmin) {
				payload.name = values.name;
				payload.taxRate = Number(values.taxRate) / 100;
				payload.logoUrl = values.logoUrl;
				payload.primaryColor = values.primaryColor;
				payload.secondaryColor = values.secondaryColor;
			}

			await updateSettings(payload).unwrap();
			toast({ title: "Settings saved successfully" });
		} catch {
			toast({ title: "Failed to save settings", variant: "destructive" });
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				{/* Store name — SUPERADMIN only */}
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Store Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Contact fields — MANAGER+ can edit */}
				<FormField
					control={form.control}
					name='phone'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!canEdit}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!canEdit}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='address'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!canEdit}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Currency symbol — MANAGER+ can edit */}
				<FormField
					control={form.control}
					name='currencySymbol'
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Currency Symbol
							</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!canEdit}
									className='focus:border-brand-main-400 w-24'
									placeholder='₦'
								/>
							</FormControl>
							<p className='text-xs text-slate-500'>
								Displayed on receipts, carts, and analytics (e.g. ₦, $, €)
							</p>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* SUPERADMIN-only fields */}
				<FormField
					control={form.control}
					name='taxRate'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tax Rate (%)</FormLabel>
							<FormControl>
								<Input
									{...field}
									type='number'
									step='0.01'
									disabled={!isSuperAdmin}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='logoUrl'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Logo URL</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='grid grid-cols-2 gap-4'>
					<FormField
						control={form.control}
						name='primaryColor'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Primary Color
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='color'
										disabled={!isSuperAdmin}
										className='h-10'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='secondaryColor'
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Secondary Color
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='color'
										disabled={!isSuperAdmin}
										className='h-10'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{canEdit && (
					<Button
						type='submit'
						disabled={!form.formState.isDirty || isSaving}
						className='bg-brand-main-900 hover:bg-brand-main-700 text-white'>
						{isSaving ? "Saving…" : "Save Changes"}
					</Button>
				)}
			</form>
		</Form>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [changePasswordOpen, setChangePasswordOpen] = useState(false);
	const [backupDialogOpen, setBackupDialogOpen] = useState(false);

	const isSuperAdmin = !!user?.roles.includes("SUPERADMIN");
	const isManager = !!user?.roles.includes("MANAGER");
	const { data, isLoading } = useGetStoreSettingsQuery();

	const handlePasswordChangeSuccess = async () => {
		await logout();
		router.push("/login");
	};

	if (!user) return null;

	const storeDefaults: StoreSettingsFormValues | null = data?.settings
		? {
				name: data.settings.name,
				address: data.settings.address,
				phone: data.settings.phone,
				email: data.settings.email,
				taxRate: String(data.settings.taxRate * 100),
				logoUrl: data.settings.logoUrl,
				primaryColor: data.settings.primaryColor,
				secondaryColor: data.settings.secondaryColor,
				currencySymbol: data.settings.currencySymbol ?? "₦",
			}
		: null;

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold text-brand-main-900'>Settings</h1>
				<p className='text-brand-main-800 mt-1'>
					Manage your store settings and preferences
				</p>
			</div>

			<div className='grid gap-6'>
				{/* Store Information */}
				<Card>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Store className='h-5 w-5' />
							Store Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading || !storeDefaults ? (
							<p className='text-sm text-brand-main-500'>Loading…</p>
						) : (
							<StoreSettingsForm
								defaultValues={storeDefaults}
								isSuperAdmin={isSuperAdmin}
								isManager={isManager}
							/>
						)}
					</CardContent>
				</Card>

				{/* Personal Information */}
				<Card>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<User2 className='h-5 w-5' />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-2'>
							<Label>Name</Label>
							<Input value={user.name} disabled />
						</div>
						<div className='grid gap-2'>
							<Label>Username</Label>
							<Input value={user.username} disabled />
						</div>
						<div className='grid gap-2'>
							<Label>Email</Label>
							<Input value={user.email} disabled />
						</div>
						<div className='grid gap-2'>
							<Label>Role</Label>
							<Input
								value={user.roles
									.map((r, i) =>
										i === user.roles.length - 1 ? `${r}.` : `${r}, `,
									)
									.join("")}
								disabled
							/>
						</div>
					</CardContent>
				</Card>

				{/* Security */}
				<Card>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							Security
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Button
							variant='outline'
							onClick={() => setChangePasswordOpen(true)}
							className='text-brand-main-700 hover:bg-brand-main-50 bg-transparent'>
							Change Password
						</Button>
					</CardContent>
				</Card>

				{/* Database Backup — SUPERADMIN only */}
				{isSuperAdmin && (
					<Card>
						<CardHeader>
							<CardTitle className='text-brand-main-800 flex items-center gap-2'>
								<DatabaseBackup className='h-5 w-5' />
								Database Backup
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<Label>Manual Backup</Label>
								<p className='text-sm text-slate-600 mb-3'>
									Download a complete backup of your database as an Excel file
								</p>
								<Button
									onClick={() => setBackupDialogOpen(true)}
									className='bg-brand-main-900 hover:bg-brand-main-700 text-white'>
									<Download className='h-4 w-4 mr-2' />
									Create Backup
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			<ChangePasswordDialog
				open={changePasswordOpen}
				onOpenChange={setChangePasswordOpen}
				onSuccess={handlePasswordChangeSuccess}
			/>

			<BackupConfirmationDialog
				open={backupDialogOpen}
				onOpenChange={setBackupDialogOpen}
			/>
		</div>
	);
}
