import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getLicensesByTypeAndCity } from "@/db/queries";

export const revalidate = 86400;

interface TypeCityPageProps {
  params: Promise<{ type: string; city: string }>;
}

export async function generateMetadata({ params }: TypeCityPageProps): Promise<Metadata> {
  const { type, city } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${typeName} in ${cityName}, TX — Liquor Licenses`,
    description: `Browse ${typeName.toLowerCase()} liquor licenses in ${cityName}, Texas. Verified TABC data with details and revenue data.`,
    alternates: { canonical: `/directory/${type}/${city}` },
  };
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  suspended: "secondary",
  revoked: "destructive",
  expired: "outline",
};

export default async function TypeCityPage({ params }: TypeCityPageProps): Promise<React.ReactElement> {
  const { type, city } = await params;
  const typeName = decodeURIComponent(type).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = decodeURIComponent(city).replace(/\b\w/g, (c) => c.toUpperCase());

  const { results, total } = await getLicensesByTypeAndCity(typeName, cityName);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/directory" className="hover:text-primary transition-colors">Directory</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/directory/${encodeURIComponent(type)}`} className="hover:text-primary transition-colors">
          {typeName}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground font-medium">{cityName}</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        {typeName} in {cityName}, TX
      </h1>
      <p className="text-muted-foreground mb-8">
        {total.toLocaleString()} verified TABC licenses
      </p>

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No {typeName.toLowerCase()} licenses found in {cityName}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((lic) => (
            <Link key={lic.id} href={`/licenses/${lic.slug}`}>
              <Card className="h-full hover:ring-2 hover:ring-primary/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="truncate flex-1">{lic.businessName}</CardTitle>
                    <Badge variant={STATUS_VARIANT[lic.status.toLowerCase()] ?? "outline"}>
                      {lic.status}
                    </Badge>
                  </div>
                  <CardDescription>{lic.address}</CardDescription>
                </CardHeader>
                {lic.ownerName && (
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Owner: {lic.ownerName}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
