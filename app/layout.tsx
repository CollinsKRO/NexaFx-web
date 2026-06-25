import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastViewport } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NexaFx",
  description: "NexaFx Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
