import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
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
      <head>
        <AdSenseScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-stone-900 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AdBlockDetector />
      </body>
    </html>
  );
}
