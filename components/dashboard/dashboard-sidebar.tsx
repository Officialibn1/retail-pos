"use client";

import {
	BarChart3,
	Package,
	ShoppingCart,
	Users,
	Settings,
	LogOut,
	Home,
	Activity,
	Receipt,
	Store,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/auth/auth-provider";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { UserRole } from "@/lib/types";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CASHIER] as const,
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: BarChart3,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER] as const,
	},
	{
		title: "New Sale",
		url: "/dashboard/sales/new",
		icon: ShoppingCart,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CASHIER] as const,
	},
	{
		title: "Sales History",
		url: "/dashboard/sales",
		icon: Receipt,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.CASHIER] as const,
	},
	{
		title: "Inventory",
		url: "/dashboard/inventory",
		icon: Package,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER] as const,
	},
	{
		title: "Users",
		url: "/dashboard/users",
		icon: Users,
		roles: [UserRole.SUPERADMIN] as const,
	},
	{
		title: "Activity Logs",
		url: "/dashboard/activity",
		icon: Activity,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER] as const,
	},
];

export function DashboardSidebar() {
	const { user, logout } = useAuth();
	const pathname = usePathname();

	if (!user) return null;

	return (
		<Sidebar
			variant='inset'
			className='bg-lunar-green-50 border-lunar-green-200 border-r'
			collapsible='icon'>
			<SidebarHeader className='w-full pb-4'>
				<SidebarMenu className='flex items-center gap-3'>
					<SidebarMenuItem className='w-full group-data-[collapsible=icon]:hidden'>
						<SidebarMenuButton size='lg'>
							<div className='size-8 aspect-square grid place-items-center rounded-lg bg-lunar-green-600'>
								<Store className='size-4 text-white' />
							</div>

							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-lunar-green-800'>
									Retail POS
								</span>
								<span className='text-xs text-lunar-green-600'>
									Point of Sale System
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem className='w-full hidden group-data-[collapsible=icon]:block'>
						<div className='size-8 aspect-square grid place-items-center rounded-lg bg-lunar-green-600'>
							<Store className='size-4 text-white' />
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className='text-lunar-green-700'>
						Navigation
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<RoleGuard
									key={item.title}
									allowedRoles={item.roles}>
									<SidebarMenuItem>
										<SidebarMenuButton
											asChild
											tooltip={item.title}
											isActive={pathname === item.url}
											className='text-lunar-green-700 hover:bg-lunar-green-100 hover:text-lunar-green-800 data-[active=true]:bg-lunar-green-600 data-[active=true]:text-white'>
											<Link href={item.url}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</RoleGuard>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className='bg-lunar-green-200 max-w-[90%]' />

				<SidebarGroup>
					<SidebarGroupLabel className='text-lunar-green-700'>
						Settings
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip={"Settings"}
									asChild
									className='text-lunar-green-700 hover:bg-lunar-green-100 hover:text-lunar-green-800'>
									<Link href='/dashboard/settings'>
										<Settings className='h-4 w-4' />
										<span>Settings</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className='border-t border-lunar-green-200 pt-4'>
				<SidebarMenu>
					<SidebarMenuItem className='hidden group-data-[collapsible=icon]:block'>
						<Avatar className='h-8 w-8'>
							<AvatarFallback className='bg-lunar-green-600 text-white text-xs'>
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
					</SidebarMenuItem>

					<SidebarMenuItem className='flex items-center gap-3 px-2 mb-3 group-data-[collapsible=icon]:hidden'>
						<Avatar className='h-8 w-8'>
							<AvatarFallback className='bg-lunar-green-600 text-white text-xs'>
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className='flex flex-col min-w-0'>
							<span className='text-sm font-medium text-lunar-green-800 truncate'>
								{user.name}
							</span>
						</div>
					</SidebarMenuItem>

					<SidebarMenuItem className=' items-center gap-3  mb-3 hidden group-data-[collapsible=icon]:block'>
						<SidebarMenuButton
							asChild
							tooltip={"Log Out"}>
							<Tooltip>
								<Button
									variant='ghost'
									size='sm'
									asChild
									onClick={logout}
									className='w-full justify-start text-lunar-green-700'>
									<TooltipTrigger>
										<LogOut className='h-4 w-4 mr-2' />
										<TooltipContent side='right'>Log Out</TooltipContent>
									</TooltipTrigger>
								</Button>
							</Tooltip>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem className='flex items-center gap-3 px-2 mb-3 group-data-[collapsible=icon]:hidden'>
						<Button
							variant='ghost'
							size='sm'
							onClick={logout}
							className='w-full justify-start text-lunar-green-700'>
							<LogOut className='h-4 w-4 mr-2' />
							Sign Out
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
