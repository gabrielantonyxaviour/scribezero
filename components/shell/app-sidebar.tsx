"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  FileText,
  FolderCheck,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { BrandLogo } from "@/components/shell/brand-logo";
import { WalletButton } from "@/components/shell/wallet-button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Clinic",
    items: [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard },
      { href: "/app", label: "Scribe", icon: Stethoscope, badge: "live" },
      { href: "/consultations", label: "Consultations", icon: ClipboardCheck },
      { href: "/patients", label: "Patients", icon: Users },
    ],
  },
  {
    label: "0G records",
    items: [
      { href: "/records", label: "Records", icon: FolderCheck },
      { href: "/documents", label: "Documents", icon: FileText },
      { href: "/verify", label: "Verify", icon: ShieldCheck },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border">
        <BrandLogo
          href="/app"
          size="lg"
          subtitle="0G clinical scribe"
          className="rounded-md px-2 py-2 hover:bg-surface-2"
        />
        <Badge variant="outline" className="ml-2 w-fit border-jade/30 bg-jade-soft text-jade">
          Storage + TEE proof
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="border-t border-border">
        <div className="px-1">
          <WalletButton />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
