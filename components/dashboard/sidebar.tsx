"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Mail,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Upload,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useDepositStore } from "@/hooks/use-deposit-store";
import Image from "next/image";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type MenuItem =
  | { type: "link"; icon: React.ComponentType<{ className?: string }>; label: string; href: string }
  | { type: "button"; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void };

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const closeSidebar = useSidebarStore((state) => state.close);
  const openDeposit = useDepositStore((state) => state.open);
  const logout = useAuthStore((state) => state.logout);

  const handleDepositClick = () => {
    closeSidebar();
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    openDeposit();
  };

  const handleLogoutClick = () => {
    closeSidebar();
    logout();
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    { type: "link", icon: Home, label: "Dashboard", href: "/dashboard" },
    { type: "link", icon: Mail, label: "Transactions", href: "/dashboard/transactions" },
    { type: "link", icon: ArrowUpDown, label: "Convert", href: "/dashboard/convert" },
    { type: "button", icon: Download, label: "Deposit", onClick: handleDepositClick },
    { type: "link", icon: Upload, label: "Withdraw", href: "/dashboard/withdraw" },
    { type: "link", icon: CircleUserRound, label: "Settings", href: "/dashboard/settings" },
    { type: "button", icon: LogOut, label: "Logout", onClick: handleLogoutClick },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="logo p-4">
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-full px-4 py-2 bg-white dark:bg-muted/20 border border-border transition-all",
            isCollapsed ? "px-2 justify-center" : "px-4",
          )}
        >
          {!isCollapsed && (
            <Image
              src="/icons/logo.svg"
              alt="Logo"
              className="h-8"
              width={100}
              height={100}
              priority
            />
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hover:bg-muted rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              aria-label={
                isCollapsed
                  ? "Expand navigation menu"
                  : "Collapse navigation menu"
              }
            >
              {!isCollapsed ? (
                <ChevronLeft className="size-5 text-black dark:text-white" />
              ) : (
                <ChevronRight className="size-5 text-black dark:text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      <div
        className="flex-1 space-y-2.5 px-4 py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        {menuItems.map((item, idx) => {
          const isLink = item.type === "link";
          const isActive = isLink && pathname === item.href;
          const commonClasses = cn(
            "flex w-full items-center gap-3 rounded-full py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-lg cursor-pointer",
            isCollapsed ? "justify-center px-0" : "px-4",
            isActive
              ? "bg-primary text-black"
              : "bg-white dark:bg-muted/10 text-black dark:text-white hover:bg-sidebar-accent",
          );

          if (item.type === "link") {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={commonClasses}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          } else {
            return (
              <button
                key={idx}
                onClick={item.onClick}
                className={commonClasses}
                aria-label={item.label}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          }
        })}
      </div>
    </div>
  );
}
