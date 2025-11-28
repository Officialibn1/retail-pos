"use client";

import type React from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<ProtectedRoute>
			<SidebarProvider>
				<DashboardSidebar />
				<SidebarInset className=' m-0 rounded-none border-0 shadow-none'>
					<DashboardHeader />
					<div className='flex flex-1 flex-col gap-4 pt-0'>
						<div className='min-h-[100vh] flex-1  bg-white md:min-h-min'>
							{children}
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</ProtectedRoute>
	);
}
