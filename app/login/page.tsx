"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	if (user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-lunar-green-50'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunar-green-600 mx-auto'></div>
					<p className='mt-2 text-lunar-green-700'>Redirecting...</p>
				</div>
			</div>
		);
	}

	return <LoginForm />;
}
