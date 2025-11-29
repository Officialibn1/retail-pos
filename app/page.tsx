"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
	const { user, isLoading, loggingIn, loggingOut } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !loggingIn && !loggingOut) {
			if (user) {
				router.push("/dashboard");
				console.log("Redirecting to dashboard...");
			} else {
				router.push("/login");
				console.log("Redirecting to login...");
			}
		}
	}, [user, isLoading, router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-lunar-green-50'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunar-green-600 mx-auto'></div>
				<p className='mt-2 text-lunar-green-700'>Loading...</p>
			</div>
		</div>
	);
}
