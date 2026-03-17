import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getTopRevenueEstablishmentsByCity } from "@/db/queries";

export const revalidate = 86400;

interface TopRevenueCityProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({
  params,
}: TopRevenueCityProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );
  return {
    title: `Top Revenue Bars & Restaurants in ${cityName}, TX`,
    description: `See the highest-grossing bars, restaurants, and liquor establishments in ${cityName}, Texas based on verified TABC revenue data.`,
    alternates: { canonical: `/top-revenue/${city}` },
  };
}

export default async function TopRevenueCityPage({
  params,
}: TopRevenueCityProps): Promise<React.ReactElement> {
  const { city } = await params;
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) =>
    c.toUpperCase()
  );

  const topEstablishments = await getTopRevenueEstablishmentsByCity(cityName);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/top-revenue" className="hover:text-primary transition-colors">Top Revenue</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Top Revenue Bars & Restaurants in {cityName}, TX
      </h1>
      <p className="text-muted-foreground mb-8">
        Ranked by total Mixed Beverage Gross Receipts
      </p>

      {topEstablishments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No revenue data available for {cityName} yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Establishment</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Liquor</TableHead>
                <TableHead className="text-right">Beer</TableHead>
                <TableHead className="text-right">Wine</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEstablishments.map((e, i) => (
                <TableRow key={`${e.businessName}-${i}`}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{e.businessName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{e.address}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ${Number(e.totalRevenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${Number(e.liquorRevenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${Number(e.beerRevenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${Number(e.wineRevenue || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
