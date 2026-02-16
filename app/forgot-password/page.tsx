"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ForgotPasswordPage() {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	if (user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-brand-main-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-main-600 mx-auto'></div>
					<p className='mt-2 text-brand-main-700'>Redirecting...</p>
				</div>
			</div>
		);
	}

	return <ForgotPasswordForm />;
}
