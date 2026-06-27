"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, User, Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSidebarStore } from "@/hooks/use-sidebar-store";
import { useNotificationsStore } from "@/hooks/use-notifications-store";
import { NotificationsPanel } from "@/components/notifications";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function Topbar() {
  const pathname = usePathname();
  const openSidebar = useSidebarStore((state) => state.open);

  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const {
    unreadCount,
    fetchUnreadCount,
    toggle: toggleNotifications,
  } = useNotificationsStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  // Format title from pathname: /dashboard -> Dashboard
  const title = pathname.split("/").filter(Boolean).pop() || "Dashboard";
  const capitalisedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={openSidebar}
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {capitalisedTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-full transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {mounted ? (
            isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
          ) : (
            <span className="h-5 w-5" />
          )}
        </button>

        <div className="relative">
          {/* Mobile: Link to notifications page */}
          <Link
            href="/notifications"
            className="md:hidden relative flex items-center justify-center min-h-[44px] min-w-[44px] p-2 hover:bg-muted rounded-full transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            aria-label={`View notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"
                aria-label={`${unreadCount} unread notifications`}
              />
            )}
          </Link>

          {/* Desktop: Toggle notifications panel */}
          <button
            onClick={toggleNotifications}
            className="hidden md:block relative p-2 hover:bg-muted rounded-full transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
            aria-label={`Toggle notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"
                aria-label={`${unreadCount} unread notifications`}
              />
            )}
          </button>

          {/* Desktop notifications panel */}
          <div className="hidden md:block">
            <NotificationsPanel />
          </div>
        </div>

        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
