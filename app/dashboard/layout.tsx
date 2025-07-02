<<<<<<< HEAD
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import DashboardLayoutClient from "./dashboard-layout-client";

const SupportChat = dynamic(
  () => import("@/components/shared/support-chat").then((m) => m.SupportChat),
  { ssr: false },
);

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <SupportChat />
    </>
  );
}
=======
// import type React from "react";
// import { Inter } from "next/font/google";

// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return <main className={inter.className}>{children}</main>;
// }

// components/Layout.tsx
'use client';

import { ReactNode } from 'react';
import { useSidebarStore } from '@/store/sidebarStore';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="bg-[#F0F0F0] min-h-screen">
      <Navbar />
      <Sidebar />

      {/* Main content */}
      <div
        className={`p-4 transition-all duration-300 ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        } pt-20`}>
        <div className="p-4 rounded-lg min-h-[calc(100vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
>>>>>>> 3042a2a (feat: worked on dashboard sidebar and navbar)
