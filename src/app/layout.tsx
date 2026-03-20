import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganization } from "@/components/seo/schemas";
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com"
  ),
  title: {
    default: "BarBook Texas — Texas Liquor License Intelligence",
    template: "%s | BarBook Texas",
  },
  description:
    "Search 80,000+ Texas liquor licenses. View establishment details, revenue data, violations, and more from verified TABC public records.",
  openGraph: {
    title: "BarBook Texas — Texas Liquor License Intelligence",
    description:
      "Search 80,000+ Texas liquor licenses with revenue data, violations, and analytics.",
    siteName: "BarBook Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
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
        <JsonLd data={buildOrganization()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-stone-900 min-h-screen flex flex-col`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-amber-600 focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <AdBlockDetector />
      </body>
    </html>
  );
}
