"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import Link from "next/link";
import { useGetStoreSettingsQuery } from "@/lib/store/api";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const { login, loggingIn } = useAuth();
	const { data: storeData } = useGetStoreSettingsQuery();
	const storeName = storeData?.settings?.name;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			await login({ email, password });
			toast.success("Login successfully.");
		} catch (err: any) {
			console.log("LOGIN ERROR: ", JSON.stringify(err, null, 2));
			// Handle RTK Query errors
			if (err?.data?.error?.message) {
				setError(err.data.error.message);
				toast.error(err.data.error.message);
			} else if (err?.message) {
				setError(err.message);
				toast.error(err.message);
			} else {
				setError("An unexpected error occurred. Please try again.");
				toast.error("An unexpected error occurred. Please try again.");
			}
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-brand-main-50 p-4'>
			<Card className='w-full max-w-md'>
				<div className='self-center rounded-xl shadow-lg bg-brand-main-100 text-brand-main-800 p-2'>
					<Store className='size-16' />
				</div>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl font-bold text-brand-main-800'>
						{storeName}
					</CardTitle>
					<CardDescription>Sign in to access your dashboard</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='Enter your email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={loggingIn}
							/>
						</div>
						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<Label htmlFor='password'>Password</Label>
								<Link
									href='/forgot-password'
									className='text-xs text-brand-main-600 hover:text-brand-main-700'>
									Forgot Password?
								</Link>
							</div>
							<Input
								id='password'
								type='password'
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={loggingIn}
							/>
						</div>
						{error && (
							<Alert variant='destructive'>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button
							type='submit'
							className='w-full bg-brand-main-600 hover:bg-brand-main-700'
							disabled={loggingIn}>
							{loggingIn ? <Spinner /> : "Sign In"}
						</Button>
					</form>

					<div className='mt-6 p-4 bg-brand-main-100 rounded-lg hidden'>
						<p className='text-sm font-medium text-brand-main-800 mb-2'>
							Demo Accounts:
						</p>
						<div className='space-y-1 text-xs text-brand-main-700'>
							<p>
								<strong>SuperAdmin:</strong> admin@store.com
							</p>
							<p>
								<strong>Manager:</strong> manager@store.com
							</p>
							<p>
								<strong>SalesPerson:</strong> mike@store.com
							</p>
							<p className='mt-2'>
								<strong>Password:</strong> password123
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
