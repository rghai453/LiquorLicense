import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await db
    .select({
      businessName: licenses.businessName,
      city: licenses.city,
      licenseType: licenses.licenseType,
      slug: licenses.slug,
    })
    .from(licenses)
    .where(
      or(
        ilike(licenses.businessName, `%${q}%`),
        ilike(licenses.dba, `%${q}%`)
      )
    )
    .limit(10);

  return NextResponse.json({ results });
}
