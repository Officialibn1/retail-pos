"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";
import { ChangePasswordDialog } from "@/components/auth/change-password-dialog";
import { BackupConfirmationDialog } from "@/components/settings/backup-confirmation-dialog";
import { Store, Shield, DatabaseBackup, User2, Download } from "lucide-react";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME;
const storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS;
const taxRate = process.env.NEXT_PUBLIC_TAX_AMOUNT;
const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE;

export default function SettingsPage() {
	const { user, logout } = useAuth();
	const router = useRouter();

	const [changePasswordOpen, setChangePasswordOpen] = useState(false);
	const [backupDialogOpen, setBackupDialogOpen] = useState(false);

	const handlePasswordChangeSuccess = async () => {
		// Log out the user after successful password change
		await logout();
		router.push("/login");
	};

	if (!user) return null;

	return (
		<div className='space-y-6 p-6'>
			<div>
				<h1 className='text-3xl font-bold text-brand-main-800'>Settings</h1>
				<p className='text-brand-main-600 mt-1'>
					Manage your store settings and preferences
				</p>
			</div>

			<div className='grid gap-6'>
				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Store className='h-5 w-5' />
							Store Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-2'>
							<Label
								htmlFor='storeName'
								className='text-brand-main-700'>
								Store Name
							</Label>
							<Input
								id='storeName'
								value={storeName}
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='storeName'
								className='text-brand-main-700'>
								Store Phone
							</Label>
							<Input
								id='storePhone'
								value={storePhone}
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='storeAddress'
								className='text-brand-main-700'>
								Store Address
							</Label>
							<Input
								id='storeAddress'
								disabled
								value={storeAddress}
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='taxRate'
								className='text-brand-main-700'>
								Tax Rate (%)
							</Label>
							<Input
								id='taxRate'
								type='number'
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
								value={Number(taxRate || 0) * 100}
							/>
						</div>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<User2 className='h-5 w-5' />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='grid gap-2'>
							<Label
								htmlFor='userName'
								className='text-brand-main-700'>
								Name
							</Label>
							<Input
								id='userName'
								value={user.name}
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='userName'
								className='text-brand-main-700'>
								Username
							</Label>
							<Input
								id='userName'
								value={user.username}
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='storeName'
								className='text-brand-main-700'>
								Email
							</Label>
							<Input
								id='storePhone'
								value={user.email}
								disabled
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
						<div className='grid gap-2'>
							<Label
								htmlFor='storeAddress'
								className='text-brand-main-700'>
								Role
							</Label>
							<Input
								id='storeAddress'
								disabled
								value={user.roles.map((role, i) =>
									i === user.roles.length - 1 ? `${role}.` : `${role}, `,
								)}
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Shield className='h-5 w-5' />
							Security
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<Button
							variant='outline'
							onClick={() => setChangePasswordOpen(true)}
							className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 bg-transparent'>
							Change Password
						</Button>
					</CardContent>
				</Card>

				{user.roles.includes("SUPERADMIN") && (
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

				{/* <Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<Palette className='h-5 w-5' />
							Appearance
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div>
								<Label className='text-brand-main-700'>Dark Mode</Label>
								<p className='text-sm text-brand-main-600'>
									Switch to dark theme
								</p>
							</div>
							<Switch
								checked={darkMode}
								onCheckedChange={setDarkMode}
							/>
						</div>
					</CardContent>
				</Card> */}
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
