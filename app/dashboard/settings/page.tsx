"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth/auth-provider";
import { Store, Bell, Shield, Palette, DatabaseBackup } from "lucide-react";
import { UserRole } from "@/lib/types";

export default function SettingsPage() {
	const { user } = useAuth();
	const [storeName, setStoreName] = useState("Retail Store POS");
	const [storeAddress, setStoreAddress] = useState(
		"123 Main Street, City, State 12345",
	);
	const [taxRate, setTaxRate] = useState("10");
	const [notifications, setNotifications] = useState(true);
	const [autoBackup, setAutoBackup] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

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
				{/* Store Settings */}
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
								onChange={(e) => setStoreName(e.target.value)}
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
								value={storeAddress}
								onChange={(e) => setStoreAddress(e.target.value)}
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
								value={taxRate}
								onChange={(e) => setTaxRate(e.target.value)}
								className='border-brand-main-200 focus:border-brand-main-400'
							/>
						</div>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card className='border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800 flex items-center gap-2'>
							<DatabaseBackup className='h-5 w-5' />
							Database
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						{/* <div className='flex items-center justify-between'>
							<div>
								<Label className='text-brand-main-700'>
									Enable Notifications
								</Label>
								<p className='text-sm text-brand-main-600'>
									Receive alerts for low stock and sales
								</p>
							</div>
							<Switch
								checked={notifications}
								onCheckedChange={setNotifications}
							/>
						</div> */}
						<div className='flex items-center justify-between'>
							<div>
								<Label className='text-brand-main-700'>Auto Backup</Label>
								<p className='text-sm text-brand-main-600'>
									Automatically backup data daily
								</p>
							</div>
							<Switch
								checked={autoBackup}
								onCheckedChange={setAutoBackup}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Appearance Settings */}
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

				{/* Security Settings - Only for SuperAdmin */}
				{user.roles.includes("SUPERADMIN") && (
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
								className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 bg-transparent'>
								Change Password
							</Button>
						</CardContent>
					</Card>
				)}

				<div className='flex justify-end'>
					<Button className='bg-brand-main-600 hover:bg-brand-main-700 text-white'>
						Save Settings
					</Button>
				</div>
			</div>
		</div>
	);
}
