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
import { ApiClientError } from "@/lib/api-client";
import { Store } from "lucide-react";

interface LoginFormProps {
	onLogin: (credentials: { email: string; password: string }) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await onLogin({ email, password });
		} catch (err) {
			if (err instanceof ApiClientError) {
				setError(err.message);
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-lunar-green-50 p-4'>
			<Card className='w-full max-w-md'>
				<div className='self-center rounded-xl shadow-lg bg-lunar-green-100 text-lunar-green-800 p-2'>
					<Store className='size-16' />
				</div>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl font-bold text-lunar-green-800'>
						Retail POS System
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
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && (
							<Alert variant='destructive'>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}
						<Button
							type='submit'
							className='w-full bg-lunar-green-600 hover:bg-lunar-green-700'
							disabled={isLoading}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>

					<div className='mt-6 p-4 bg-lunar-green-100 rounded-lg hidden'>
						<p className='text-sm font-medium text-lunar-green-800 mb-2'>
							Demo Accounts:
						</p>
						<div className='space-y-1 text-xs text-lunar-green-700'>
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
