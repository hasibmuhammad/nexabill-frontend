import { ThemeScript } from "@/components/theme-script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISP Billing - Admin Panel",
  description:
    "Modern ISP billing and Mikrotik management system for Bangladesh",
  keywords: [
    "ISP",
    "billing",
    "mikrotik",
    "bangladesh",
    "internet service provider",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
