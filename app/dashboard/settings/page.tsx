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
// All fields are strings at the form level; taxRate is converted on submit.

const storeSettingsSchema = z.object({
	name: z.string().min(1, "Store name is required"),
	address: z.string(),
	phone: z.string(),
	// Allow empty string OR a valid email
	email: z.string().refine((v) => v === "" || z.string().email().safeParse(v).success, {
		message: "Invalid email address",
	}),
	taxRate: z.string().refine((v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, {
		message: "Must be a number between 0 and 100",
	}),
	logoUrl: z.string(),
	primaryColor: z.string(),
	secondaryColor: z.string(),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

// ─── Inner form — only mounts once data is ready ──────────────────────────────

function StoreSettingsForm({
	defaultValues,
	isSuperAdmin,
}: {
	defaultValues: StoreSettingsFormValues;
	isSuperAdmin: boolean;
}) {
	const { toast } = useToast();
	const [updateSettings, { isLoading: isSaving }] =
		useUpdateStoreSettingsMutation();

	const form = useForm<StoreSettingsFormValues>({
		resolver: zodResolver(storeSettingsSchema),
		defaultValues,
	});

	const onSubmit = async (values: StoreSettingsFormValues) => {
		try {
			await updateSettings({
				name: values.name,
				address: values.address,
				phone: values.phone,
				email: values.email,
				taxRate: Number(values.taxRate) / 100,
				logoUrl: values.logoUrl,
				primaryColor: values.primaryColor,
				secondaryColor: values.secondaryColor,
			}).unwrap();
			toast({ title: "Settings saved successfully" });
		} catch {
			toast({ title: "Failed to save settings", variant: "destructive" });
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='text-brand-main-700'>Store Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='phone'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='text-brand-main-700'>Phone</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
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
							<FormLabel className='text-brand-main-700'>Email</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
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
							<FormLabel className='text-brand-main-700'>Address</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='taxRate'
					render={({ field }) => (
						<FormItem>
							<FormLabel className='text-brand-main-700'>Tax Rate (%)</FormLabel>
							<FormControl>
								<Input
									{...field}
									type='number'
									step='0.01'
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
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
							<FormLabel className='text-brand-main-700'>Logo URL</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={!isSuperAdmin}
									className='border-brand-main-200 focus:border-brand-main-400'
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
								<FormLabel className='text-brand-main-700'>Primary Color</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='color'
										disabled={!isSuperAdmin}
										className='h-10 border-brand-main-200'
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
								<FormLabel className='text-brand-main-700'>Secondary Color</FormLabel>
								<FormControl>
									<Input
										{...field}
										type='color'
										disabled={!isSuperAdmin}
										className='h-10 border-brand-main-200'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				{isSuperAdmin && (
					<Button
						type='submit'
						disabled={!form.formState.isDirty || isSaving}
						className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
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
	const { data, isLoading } = useGetStoreSettingsQuery();

	const handlePasswordChangeSuccess = async () => {
		await logout();
		router.push("/login");
	};

	if (!user) return null;

	// Only build defaults once data has arrived — form mounts with correct
	// values so no reset() race can cause stale validation errors.
	const storeDefaults: StoreSettingsFormValues | null = data?.settings
		? {
				name: data.settings.name,
				address: data.settings.address,
				phone: data.settings.phone,
				email: data.settings.email,
				// taxRate stored as decimal (0.075), displayed as percent (7.5)
				taxRate: String(data.settings.taxRate * 100),
				logoUrl: data.settings.logoUrl,
				primaryColor: data.settings.primaryColor,
				secondaryColor: data.settings.secondaryColor,
			}
		: null;

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold text-brand-main-800'>Settings</h1>
				<p className='text-brand-main-600 mt-1'>
					Manage your store settings and preferences
				</p>
			</div>

			<div className='grid gap-6'>
				{/* Store Information */}
				<Card className='border-brand-main-200'>
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
							/>
						)}
					</CardContent>
				</Card>

				{/* Personal Information */}
				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<User2 className='h-5 w-5' />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-2'>
							<Label className='text-brand-main-700'>Name</Label>
							<Input value={user.name} disabled className='border-brand-main-200' />
						</div>
						<div className='grid gap-2'>
							<Label className='text-brand-main-700'>Username</Label>
							<Input value={user.username} disabled className='border-brand-main-200' />
						</div>
						<div className='grid gap-2'>
							<Label className='text-brand-main-700'>Email</Label>
							<Input value={user.email} disabled className='border-brand-main-200' />
						</div>
						<div className='grid gap-2'>
							<Label className='text-brand-main-700'>Role</Label>
							<Input
								value={user.roles
									.map((r, i) =>
										i === user.roles.length - 1 ? `${r}.` : `${r}, `,
									)
									.join("")}
								disabled
								className='border-brand-main-200'
							/>
						</div>
					</CardContent>
				</Card>

				{/* Security */}
				<Card className='border-brand-main-200'>
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
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 bg-transparent'>
							Change Password
						</Button>
					</CardContent>
				</Card>

				{/* Database Backup — SUPERADMIN only */}
				{isSuperAdmin && (
					<Card className='border-brand-main-200'>
						<CardHeader>
							<CardTitle className='text-brand-main-800 flex items-center gap-2'>
								<DatabaseBackup className='h-5 w-5' />
								Database Backup
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div>
								<Label className='text-brand-main-700'>Manual Backup</Label>
								<p className='text-sm text-brand-main-600 mb-3'>
									Download a complete backup of your database as an Excel file
								</p>
								<Button
									onClick={() => setBackupDialogOpen(true)}
									className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
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
