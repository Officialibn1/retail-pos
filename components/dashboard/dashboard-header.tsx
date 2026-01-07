"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
	const pathname = usePathname();

	const getBreadcrumbs = () => {
		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs = [];

		if (segments.length > 1) {
			breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });

			for (let i = 1; i < segments.length; i++) {
				const segment = segments[i];
				const href = "/" + segments.slice(0, i + 1).join("/");
				const label =
					segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");

				if (i === segments.length - 1) {
					breadcrumbs.push({ label, href, isLast: true });
				} else {
					breadcrumbs.push({ label, href });
				}
			}
		} else {
			breadcrumbs.push({
				label: "Dashboard",
				href: "/dashboard",
				isLast: true,
			});
		}

		return breadcrumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	return (
		<header className='flex h-16 shrink-0 items-center gap-2 border-b border-brand-main-200 px-4'>
			<SidebarTrigger className='text-brand-main-700 hover:bg-brand-main-100' />
			<Separator
				orientation='vertical'
				className='mr-2 h-4 bg-brand-main-200'
			/>

			<Breadcrumb>
				<BreadcrumbList>
					{breadcrumbs.map((crumb, index) => (
						<div
							key={crumb.href}
							className='flex items-center'>
							<BreadcrumbItem>
								{crumb.isLast ? (
									<BreadcrumbPage className='text-brand-main-800'>
										{crumb.label}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink
										asChild
										className='text-brand-main-600 hover:text-brand-main-800'>
										<Link href={crumb.href}>{crumb.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{index < breadcrumbs.length - 1 && (
								<BreadcrumbSeparator className='text-brand-main-400' />
							)}
						</div>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			<div className='ml-auto flex items-center gap-2'>
				<Button
					variant='ghost'
					size='icon'
					className='text-brand-main-600 hover:bg-brand-main-100'>
					<Bell className='h-4 w-4' />
				</Button>
			</div>
		</header>
	);
}
