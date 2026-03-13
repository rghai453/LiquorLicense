import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getLicensesByType } from "@/db/queries";

export const revalidate = 86400;

interface TypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { type } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${typeName} Licenses in Texas`,
    description: `Browse all ${typeName} liquor licenses in Texas. Verified TABC data with details and revenue reports.`,
  };
}

export default async function TypePage({ params }: TypePageProps): Promise<React.ReactElement> {
  const { type } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const { results, total, topCities } = await getLicensesByType(typeName);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/directory" className="hover:text-primary transition-colors">Directory</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{typeName}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {typeName} Licenses in Texas
      </h1>
      <p className="text-muted-foreground mb-8">
        {total.toLocaleString()} verified TABC licenses
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-bold tracking-tight mb-4">Top Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topCities.map((c) => c.city && (
            <Link
              key={c.city}
              href={`/directory/${encodeURIComponent(type)}/${encodeURIComponent(c.city.toLowerCase())}`}
              className="flex justify-between items-center p-3 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <span className="font-medium text-sm">{c.city}</span>
              <Badge variant="secondary">{c.count}</Badge>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((lic) => (
          <Link key={lic.id} href={`/licenses/${lic.slug}`}>
            <Card className="h-full hover:ring-2 hover:ring-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="truncate">{lic.businessName}</CardTitle>
                <CardDescription>{lic.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {lic.city}, {lic.county} County
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {total > 24 && (
        <div className="text-center mt-8">
          <Link href={`/directory?type=${encodeURIComponent(typeName)}`} className={cn(buttonVariants({ variant: "default" }))}>
            View All {total.toLocaleString()} {typeName} Licenses
          </Link>
        </div>
      )}
    </div>
  );
}
