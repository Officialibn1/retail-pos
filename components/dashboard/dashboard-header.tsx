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
import { Input } from "@/components/ui/input";

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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-lunar-green-200 px-4">
      <SidebarTrigger className="text-lunar-green-700 hover:bg-lunar-green-100" />
      <Separator
        orientation="vertical"
        className="mr-2 h-4 bg-lunar-green-200"
      />

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage className="text-lunar-green-800">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={crumb.href}
                    className="text-lunar-green-600 hover:text-lunar-green-800"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator className="text-lunar-green-400" />
              )}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-lunar-green-500" />
          <Input
            type="search"
            placeholder="Search Inventory..."
            className="w-64 pl-8 border-lunar-green-200 focus:border-lunar-green-400"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-lunar-green-600 hover:bg-lunar-green-100"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
