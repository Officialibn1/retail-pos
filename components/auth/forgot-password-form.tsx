"use client";

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
import { Store, ArrowLeft, Mail, KeyRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME;

export function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [resetType, setResetType] = useState<"LINK" | "OTP">("LINK");
	const [showOtpInput, setShowOtpInput] = useState(false);
	const [verifiedToken, setVerifiedToken] = useState("");

	const handleRequestReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/request-reset", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, type: resetType }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || "Failed to send reset request");
			}

			if (resetType === "LINK") {
				setSuccess(
					"If an account with that email exists, a password reset link has been sent to your email.",
				);
				toast.success("Password reset link sent! Check your email.");
			} else {
				setShowOtpInput(true);
				setSuccess(
					"If an account with that email exists, an OTP has been sent to your email.",
				);
				toast.success("OTP sent! Check your email.");
			}
		} catch (err: any) {
			const errorMessage = err.message || "An unexpected error occurred";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || "Invalid OTP");
			}

			setVerifiedToken(data.token);
			toast.success("OTP verified! Redirecting to reset password...");

			// Redirect to reset password page with token
			window.location.href = `/reset-password?token=${data.token}`;
		} catch (err: any) {
			const errorMessage = err.message || "Failed to verify OTP";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
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
					<CardDescription>
						{showOtpInput
							? "Enter the OTP sent to your email"
							: "Reset your password"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!showOtpInput ? (
						<Tabs
							value={resetType}
							onValueChange={(value) => setResetType(value as "LINK" | "OTP")}
							className='w-full'>
							<TabsList className='grid w-full grid-cols-2 mb-4'>
								<TabsTrigger value='LINK'>
									<Mail className='h-4 w-4 mr-2' />
									Email Link
								</TabsTrigger>
								<TabsTrigger value='OTP'>
									<KeyRound className='h-4 w-4 mr-2' />
									OTP Code
								</TabsTrigger>
							</TabsList>

							<TabsContent value='LINK'>
								<form
									onSubmit={handleRequestReset}
									className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='email-link'>Email Address</Label>
										<Input
											id='email-link'
											type='email'
											placeholder='Enter your email'
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											disabled={isLoading}
										/>
										<p className='text-xs text-brand-main-600'>
											We'll send you a secure link to reset your password
										</p>
									</div>

									{error && (
										<Alert variant='destructive'>
											<AlertDescription>{error}</AlertDescription>
										</Alert>
									)}

									{success && (
										<Alert className='border-green-200 bg-green-50'>
											<AlertDescription className='text-green-800'>
												{success}
											</AlertDescription>
										</Alert>
									)}

									<Button
										type='submit'
										className='w-full bg-brand-main-600 hover:bg-brand-main-700'
										disabled={isLoading}>
										{isLoading ? <Spinner /> : "Send Reset Link"}
									</Button>
								</form>
							</TabsContent>

							<TabsContent value='OTP'>
								<form
									onSubmit={handleRequestReset}
									className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='email-otp'>Email Address</Label>
										<Input
											id='email-otp'
											type='email'
											placeholder='Enter your email'
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											disabled={isLoading}
										/>
										<p className='text-xs text-brand-main-600'>
											We'll send you a 6-digit code to verify your identity
										</p>
									</div>

									{error && (
										<Alert variant='destructive'>
											<AlertDescription>{error}</AlertDescription>
										</Alert>
									)}

									{success && (
										<Alert className='border-green-200 bg-green-50'>
											<AlertDescription className='text-green-800'>
												{success}
											</AlertDescription>
										</Alert>
									)}

									<Button
										type='submit'
										className='w-full bg-brand-main-600 hover:bg-brand-main-700'
										disabled={isLoading}>
										{isLoading ? <Spinner /> : "Send OTP"}
									</Button>
								</form>
							</TabsContent>
						</Tabs>
					) : (
						<form
							onSubmit={handleVerifyOtp}
							className='space-y-4'>
							<div className='space-y-2'>
								<Label htmlFor='otp'>Enter OTP</Label>
								<Input
									id='otp'
									type='text'
									placeholder='Enter 6-digit code'
									value={otp}
									onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
									maxLength={6}
									required
									disabled={isLoading}
									className='text-center text-2xl tracking-widest font-mono'
								/>
								<p className='text-xs text-brand-main-600'>
									Check your email for the 6-digit verification code
								</p>
							</div>

							{error && (
								<Alert variant='destructive'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							<Button
								type='submit'
								className='w-full bg-brand-main-600 hover:bg-brand-main-700'
								disabled={isLoading || otp.length !== 6}>
								{isLoading ? <Spinner /> : "Verify OTP"}
							</Button>

							<Button
								type='button'
								variant='outline'
								className='w-full'
								onClick={() => {
									setShowOtpInput(false);
									setOtp("");
									setError("");
									setSuccess("");
								}}
								disabled={isLoading}>
								<ArrowLeft className='h-4 w-4 mr-2' />
								Back
							</Button>
						</form>
					)}

					<div className='mt-6 text-center'>
						<Link
							href='/login'
							className='text-sm text-brand-main-600 hover:text-brand-main-700 inline-flex items-center'>
							<ArrowLeft className='h-4 w-4 mr-1' />
							Back to Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
