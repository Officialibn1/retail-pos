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
	FolderKanban,
	UserCircle,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { UserRole } from "@/lib/types";
import { Spinner } from "../ui/spinner";
import { canManageInventory } from "@/lib/auth";
import { useGetStoreSettingsQuery, useGetLowStockNotificationsQuery } from "@/lib/store/api";

const navigationItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
		roles: [
			UserRole.SUPERADMIN,
			UserRole.MANAGER,
			UserRole.ADMIN,
			UserRole.CASHIER,
		] as const,
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
		roles: [
			UserRole.SUPERADMIN,
			UserRole.MANAGER,
			UserRole.CASHIER,
			UserRole.ADMIN,
		] as const,
	},
	{
		title: "Sales History",
		url: "/dashboard/sales",
		icon: Receipt,
		roles: [
			UserRole.SUPERADMIN,
			UserRole.MANAGER,
			UserRole.CASHIER,
			UserRole.ADMIN,
		] as const,
	},
	{
		title: "Inventory",
		url: "/dashboard/inventory",
		icon: Package,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER] as const,
	},
	{
		title: "Categories",
		url: "/dashboard/categories",
		icon: FolderKanban,
		roles: [UserRole.SUPERADMIN, UserRole.MANAGER, UserRole.ADMIN] as const,
	},
	{
		title: "Customers",
		url: "/dashboard/customers",
		icon: UserCircle,
		roles: [
			UserRole.SUPERADMIN,
			UserRole.MANAGER,
			UserRole.CASHIER,
			UserRole.ADMIN,
		] as const,
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
	const { user, logout, loggingOut } = useAuth();
	const pathname = usePathname();
	const { data: storeData } = useGetStoreSettingsQuery();
	const storeName = storeData?.settings?.name;

	const isManager = user ? canManageInventory(user.roles) : false;
	const { data: lowStockData } = useGetLowStockNotificationsQuery(undefined, {
		skip: !isManager,
		pollingInterval: 120000,
	});
	const lowStockCount = lowStockData?.count ?? 0;

	if (!user) return null;

	return (
		<Sidebar
			variant='inset'
			className='bg-muted border-r'
			collapsible='icon'>
			<SidebarHeader className='w-full pb-4'>
				<SidebarMenu className='flex items-center gap-3'>
					<SidebarMenuItem className='w-full group-data-[collapsible=icon]:hidden'>
						<SidebarMenuButton size='lg' className="bg-border hover:bg-border">
							<div className='size-8 aspect-square grid place-items-center rounded-lg bg-brand-main-900'>
								<Store className='size-4 text-white' />
							</div>

							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-brand-main-900'>
									{storeName}
								</span>
								<span className='text-xs text-brand-main-700'>
									Point of Sale System
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem className='w-full hidden group-data-[collapsible=icon]:block'>
						<div className='size-8 aspect-square grid place-items-center rounded-lg bg-brand-main-900'>
							<Store className='size-4 text-white' />
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className='text-brand-main-900 font-semibold'>
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
											className='text-slate-600 hover:bg-slate-100 hover:text-slate-800 data-[active=true]:bg-brand-main-900 data-[active=true]:text-white'>
											<Link href={item.url}>
												<item.icon className='h-4 w-4' />
												<span>{item.title}</span>
												{item.title === "Inventory" && isManager && lowStockCount > 0 && (
													<Badge data-active={pathname === item.url} className='ml-auto h-5 min-w-5 flex items-center justify-center rounded-full text-[10px] font-bold font-mono bg-white hover:bg-white text-brand-main-900 border-0 data-[active=false]:bg-brand-main-900 data-[active=false]:text-white'>
														{lowStockCount > 99 ? "99+" : lowStockCount}
													</Badge>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</RoleGuard>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator className='bg-border max-w-[90%]' />

				<SidebarGroup>
					<SidebarGroupLabel className='text-brand-main-900 font-semibold'>
						Settings
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip={"Settings"}
									isActive={pathname === "/dashboard/settings"}
									asChild
									className='text-slate-600 hover:bg-slate-100 hover:text-slate-800 data-[active=true]:bg-brand-main-900 data-[active=true]:text-white'>
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

			<SidebarFooter className='border-t pt-4'>
				<SidebarMenu>
					<SidebarMenuItem className='hidden group-data-[collapsible=icon]:block'>
						<Avatar className='h-8 w-8'>
							<AvatarFallback className='bg-brand-main-900 text-white text-xs'>
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
					</SidebarMenuItem>

					<SidebarMenuItem className='flex items-center gap-3 px-2 mb-3 group-data-[collapsible=icon]:hidden'>
						<Avatar className='h-8 w-8'>
							<AvatarFallback className='bg-brand-main-900 text-white text-xs'>
								{user.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className='flex flex-col min-w-0'>
							<span className='text-sm font-medium text-brand-main-800 truncate'>
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
									disabled={loggingOut}
									className='w-full justify-start text-slate-600 hover:bg-slate-100 hover:text-slate-800'>
									<TooltipTrigger>
										{loggingOut ? (
											<Spinner className='h-4 w-4 mr-2' />
										) : (
											<LogOut className='h-4 w-4 mr-2' />
										)}

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
							disabled={loggingOut}
							className='w-full justify-start text-brand-main-700'>
							{loggingOut ? (
								<Spinner className='h-4 w-4 mr-2' />
							) : (
								<LogOut className='h-4 w-4 mr-2' />
							)}
							Sign Out
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
