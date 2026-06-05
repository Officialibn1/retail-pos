"use client";

import { useState, useEffect } from "react";
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
import { Store, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreSettingsQuery } from "@/lib/store/api";

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const { data: storeData } = useGetStoreSettingsQuery();
	const storeName = storeData?.settings?.name;

	useEffect(() => {
		if (!token) {
			toast.error("Invalid reset link");
			router.push("/forgot-password");
		}
	}, [token, router]);

	const validatePassword = (pwd: string) => {
		const minLength = pwd.length >= 8;
		const hasUpperCase = /[A-Z]/.test(pwd);
		const hasLowerCase = /[a-z]/.test(pwd);
		const hasNumber = /\d/.test(pwd);

		return {
			minLength,
			hasUpperCase,
			hasLowerCase,
			hasNumber,
			isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
		};
	};

	const passwordValidation = validatePassword(password);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!passwordValidation.isValid) {
			setError("Password does not meet requirements");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password, confirmPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || "Failed to reset password");
			}

			setSuccess(true);
			toast.success("Password reset successfully!");

			// Redirect to login after 2 seconds
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err: any) {
			const errorMessage = err.message || "An unexpected error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return null;
	}

	if (success) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-brand-main-50 p-4'>
				<Card className='w-full max-w-md'>
					<div className='self-center rounded-xl shadow-lg bg-green-100 text-green-800 p-2'>
						<CheckCircle2 className='size-16' />
					</div>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl font-bold text-brand-main-800'>
							Password Reset Successful!
						</CardTitle>
						<CardDescription>
							Your password has been reset successfully. Redirecting to login...
						</CardDescription>
					</CardHeader>
					<CardContent className='text-center'>
						<Link
							href='/login'
							className='text-brand-main-600 hover:text-brand-main-700 font-medium'>
							Go to Login
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

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
					<CardDescription>
						Create a new password for your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit}
						className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='password'>New Password</Label>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? "text" : "password"}
									placeholder='Enter new password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-brand-main-500 hover:text-brand-main-700'
									disabled={isLoading}>
									{showPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</button>
							</div>

							{password && (
								<div className='space-y-1 text-xs mt-2'>
									<p
										className={
											passwordValidation.minLength
												? "text-green-600"
												: "text-brand-main-600"
										}>
										{passwordValidation.minLength ? "✓" : "○"} At least 8
										characters
									</p>
									<p
										className={
											passwordValidation.hasUpperCase
												? "text-green-600"
												: "text-brand-main-600"
										}>
										{passwordValidation.hasUpperCase ? "✓" : "○"} One uppercase
										letter
									</p>
									<p
										className={
											passwordValidation.hasLowerCase
												? "text-green-600"
												: "text-brand-main-600"
										}>
										{passwordValidation.hasLowerCase ? "✓" : "○"} One lowercase
										letter
									</p>
									<p
										className={
											passwordValidation.hasNumber
												? "text-green-600"
												: "text-brand-main-600"
										}>
										{passwordValidation.hasNumber ? "✓" : "○"} One number
									</p>
								</div>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirmPassword'>Confirm Password</Label>
							<div className='relative'>
								<Input
									id='confirmPassword'
									type={showConfirmPassword ? "text" : "password"}
									placeholder='Confirm new password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
								<button
									type='button'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className='absolute right-3 top-1/2 -translate-y-1/2 text-brand-main-500 hover:text-brand-main-700'
									disabled={isLoading}>
									{showConfirmPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</button>
							</div>
							{confirmPassword && password !== confirmPassword && (
								<p className='text-xs text-red-600'>Passwords do not match</p>
							)}
						</div>

						{error && (
							<Alert variant='destructive'>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button
							type='submit'
							className='w-full bg-brand-main-900 hover:bg-brand-main-700'
							disabled={
								isLoading ||
								!passwordValidation.isValid ||
								password !== confirmPassword
							}>
							{isLoading ? <Spinner /> : "Reset Password"}
						</Button>
					</form>

					<div className='mt-6 text-center'>
						<Link
							href='/login'
							className='text-sm text-brand-main-600 hover:text-brand-main-700'>
							Back to Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
