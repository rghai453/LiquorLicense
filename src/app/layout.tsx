import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BarBook Texas — Texas Liquor License Intelligence",
    template: "%s | BarBook Texas",
  },
  description:
    "Search 60,000+ Texas liquor licenses. View establishment details, revenue data, violations, and more from verified TABC public records.",
  openGraph: {
    title: "BarBook Texas — Texas Liquor License Intelligence",
    description:
      "Search 60,000+ Texas liquor licenses with revenue data, violations, and analytics.",
    siteName: "BarBook Texas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-stone-900 min-h-screen flex flex-col`}
      >
        <AdSenseScript />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
