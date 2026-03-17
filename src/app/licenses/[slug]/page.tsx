import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getLicenseBySlug,
  getLicenseRevenue,
  getLicenseViolations,
} from "@/db/queries";
import { AdSlot } from "@/components/ads/AdSlot";

export const revalidate = 86400;

interface LicensePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LicensePageProps): Promise<Metadata> {
  const { slug } = await params;
  const license = await getLicenseBySlug(slug);

  if (!license) return { title: "License Not Found" };

  return {
    title: `${license.businessName} — ${license.licenseType} in ${license.city || "Texas"}`,
    description: `${license.businessName} is a verified ${license.licenseType} license holder in ${license.city || "Texas"}. License #${license.licenseNumber}. View details, revenue data, and violations from official TABC records.`,
    alternates: { canonical: `/licenses/${slug}` },
    openGraph: {
      title: `${license.businessName} — ${license.licenseType}`,
      description: `Verified TABC license data for ${license.businessName} in ${license.city || "Texas"}.`,
    },
  };
}

function getStatusVariant(
  status: string
): "default" | "destructive" | "secondary" {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "suspended":
    case "revoked":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default async function LicensePage({
  params,
}: LicensePageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const license = await getLicenseBySlug(slug);

  if (!license) notFound();

  const [revenueData, violationData] = await Promise.all([
    license.id ? getLicenseRevenue(license.id) : [],
    license.id ? getLicenseViolations(license.id) : [],
  ]);

  const totalRevenue = revenueData.reduce(
    (sum, r) => sum + (r.totalReceipts ?? 0),
    0
  );

  const details: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Address", value: license.address || "\u2014" },
    {
      label: "City",
      value: license.city ? (
        <Link
          href={`/cities/${encodeURIComponent(license.city.toLowerCase())}`}
          className="text-amber-600 hover:text-amber-700"
        >
          {license.city}
        </Link>
      ) : (
        "\u2014"
      ),
    },
    {
      label: "County",
      value: license.county ? (
        <Link
          href={`/counties/${encodeURIComponent(license.county.toLowerCase())}`}
          className="text-amber-600 hover:text-amber-700"
        >
          {license.county}
        </Link>
      ) : (
        "\u2014"
      ),
    },
    {
      label: "ZIP Code",
      value: license.zip ? (
        <Link
          href={`/zip/${license.zip}`}
          className="text-amber-600 hover:text-amber-700"
        >
          {license.zip}
        </Link>
      ) : (
        "\u2014"
      ),
    },
    { label: "Issue Date", value: license.issueDate || "\u2014" },
    { label: "Expiration Date", value: license.expirationDate || "\u2014" },
    { label: "Owner", value: license.ownerName || "\u2014" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/directory" className="hover:text-amber-600">Directory</Link>
        {license.city && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/cities/${encodeURIComponent(license.city.toLowerCase())}`}
              className="hover:text-amber-600"
            >
              {license.city}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate max-w-[200px]">
          {license.businessName}
        </span>
      </nav>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {license.businessName}
              </h1>
              {license.dba && license.dba !== license.businessName && (
                <p className="text-muted-foreground">DBA: {license.dba}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(license.status)} className="capitalize">
                  {license.status}
                </Badge>
                <Badge variant="outline">{license.licenseType}</Badge>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-muted-foreground">License Number</p>
              <p className="text-lg font-mono font-semibold">
                {license.licenseNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>License Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt className="text-sm text-muted-foreground">{d.label}</dt>
                    <dd className="font-medium">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {revenueData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue History</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Total: {formatCurrency(totalRevenue)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Liquor</TableHead>
                      <TableHead className="text-right">Beer</TableHead>
                      <TableHead className="text-right">Wine</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.reportMonth}</TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(r.totalReceipts ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCurrency(r.liquorReceipts ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCurrency(r.beerReceipts ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCurrency(r.wineReceipts ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {violationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Violations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {violationData.map((v) => (
                  <Card
                    key={v.id}
                    className="border-l-4 border-l-destructive rounded-l-none"
                  >
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{v.violationType}</p>
                        <Badge variant="destructive">Violation</Badge>
                      </div>
                      {v.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {v.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                        {v.date && <span>Date: {v.date}</span>}
                        {v.disposition && <span>Disposition: {v.disposition}</span>}
                        {v.penalty && <span>Penalty: {v.penalty}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          <AdSlot slot="license-detail-bottom" format="horizontal" className="mt-6" />
        </div>

        <div className="space-y-6">
          {revenueData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Revenue</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(Math.round(totalRevenue / revenueData.length))}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Months Tracked</p>
                  <p className="text-lg font-semibold">{revenueData.length}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Database className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-muted-foreground">Data Source</p>
                  <p className="text-muted-foreground mt-0.5">
                    Texas Alcoholic Beverage Commission (TABC) & Texas
                    Comptroller Mixed Beverage Gross Receipts
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last synced:{" "}
                    {license.lastSyncedAt
                      ? new Date(license.lastSyncedAt).toLocaleDateString()
                      : "\u2014"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AdSlot slot="license-detail-sidebar" format="rectangle" />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: license.businessName,
            address: {
              "@type": "PostalAddress",
              streetAddress: license.address,
              addressLocality: license.city,
              addressRegion: license.state,
              postalCode: license.zip,
            },
            ...(license.latitude &&
              license.longitude && {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: license.latitude,
                  longitude: license.longitude,
                },
              }),
          }),
        }}
      />
    </div>
  );
}
