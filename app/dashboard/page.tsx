"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import { canViewAllData } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { SalesChart } from "@/components/analytics/sales-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Loader2 } from "lucide-react";
import { useGetDashboardStatsQuery } from "@/lib/store/api";
import { formatNaira } from "@/lib/utils";

export default function DashboardPage() {
	const { user } = useAuth();

	// Use RTK Query hook to fetch dashboard stats
	const {
		data: stats,
		isLoading: loading,
		isError,
		error,
	} = useGetDashboardStatsQuery(undefined, {
		skip: !user,
	});

	if (!user) return null;

	const canSeeAllData = canViewAllData(user.roles);

	if (loading) {
		return (
			<div className='flex items-center justify-center h-64'>
				<Loader2 className='h-8 w-8 animate-spin text-brand-main-600' />
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			error && "data" in error
				? (error.data as any)?.message || "Failed to load dashboard data"
				: "Failed to load dashboard data";

		return (
			<div className='space-y-6 p-6'>
				<Card className='border-red-200 bg-red-50'>
					<CardHeader>
						<CardTitle className='text-red-800'>
							Error Loading Dashboard
						</CardTitle>
						<CardDescription className='text-red-700'>
							{errorMessage}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<div className='space-y-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-brand-main-800'>
						Welcome back, {user.name}
					</h1>
					<p className='text-brand-main-600 mt-1'>
						{canSeeAllData
							? "Here's an overview of your store performance"
							: "Here's your personal dashboard"}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Badge
						variant='secondary'
						className='bg-brand-main-100 text-brand-main-800'>
						{user.roles}
					</Badge>
					<Button
						asChild
						variant='outline'
						className='border-brand-main-200 text-brand-main-700 hover:bg-brand-main-50 bg-transparent'>
						<Link href='/dashboard/analytics'>
							<BarChart3 className='h-4 w-4 mr-2' />
							View Analytics
						</Link>
					</Button>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Total Revenue
						</CardTitle>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							className='h-4 w-4 text-brand-main-600'>
							<path d='M12 2v20m9-9H3' />
						</svg>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(stats.totalRevenue)}
						</div>
						<p className='text-xs text-brand-main-600'>Total sales revenue</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Orders
						</CardTitle>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							className='h-4 w-4 text-brand-main-600'>
							<rect
								width='20'
								height='14'
								x='2'
								y='5'
								rx='2'
							/>
							<path d='M2 10h20' />
						</svg>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{stats.totalSales}
						</div>
						<p className='text-xs text-brand-main-600'>Total completed sales</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Avg Order Value
						</CardTitle>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							className='h-4 w-4 text-brand-main-600'>
							<path d='m7.5 4.27 9 5.15' />
							<path d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z' />
							<path d='m3.3 7 8.7 5 8.7-5' />
							<path d='M12 22V12' />
						</svg>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{formatNaira(stats.averageOrderValue)}
						</div>
						<p className='text-xs text-brand-main-600'>Per transaction</p>
					</CardContent>
				</Card>

				<Card className='border-brand-main-200'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-brand-main-700'>
							Recent Activity
						</CardTitle>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							className='h-4 w-4 text-brand-main-600'>
							<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
							<circle
								cx='9'
								cy='7'
								r='4'
							/>
							<path d='m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7Z' />
						</svg>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-brand-main-800'>
							{stats.recentSales.length}
						</div>
						<p className='text-xs text-brand-main-600'>Recent transactions</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<Card className='col-span-4 border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>
							Sales Overview
						</CardTitle>
						<CardDescription className='text-brand-main-600'>
							Daily sales for the last 7 days
						</CardDescription>
					</CardHeader>
					<CardContent className='pl-2'>
						<SalesChart data={[]} />
					</CardContent>
				</Card>
				<Card className='col-span-3 border-brand-main-200'>
					<CardHeader>
						<CardTitle className='text-brand-main-800'>Recent Sales</CardTitle>
						<CardDescription className='text-brand-main-600'>
							{canSeeAllData
								? "Latest store transactions"
								: "Your recent sales"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-8'>
							{stats.recentSales.length > 0 ? (
								stats.recentSales.map((sale) => (
									<div
										key={sale.id}
										className='flex items-center'>
										<div className='ml-4 space-y-1'>
											<p className='text-sm font-medium leading-none text-brand-main-800'>
												{sale.id.slice(0, 8)}
											</p>
											<p className='text-sm text-brand-main-600'>
												{new Date(sale.createdAt).toLocaleDateString()} •{" "}
												{sale.customerName || "Walk-in"}
											</p>
										</div>
										<div className='ml-auto font-medium text-brand-main-800'>
											{formatNaira(Number(sale.total))}
										</div>
									</div>
								))
							) : (
								<p className='text-sm text-brand-main-600'>No recent sales</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
