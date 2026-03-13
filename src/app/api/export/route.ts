import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { licenses } from "@/db/schema";
import { ilike, and, sql } from "drizzle-orm";
import Papa from "papaparse";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // TODO: Add auth check for Pro tier
  try {
    const body = await req.json();
    const { type, city, county, status } = body as {
      type?: string;
      city?: string;
      county?: string;
      status?: string;
    };

    const conditions = [];
    if (type) conditions.push(ilike(licenses.licenseType, `%${type}%`));
    if (city) conditions.push(ilike(licenses.city, city));
    if (county) conditions.push(ilike(licenses.county, county));
    if (status) conditions.push(ilike(licenses.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        licenseNumber: licenses.licenseNumber,
        businessName: licenses.businessName,
        dba: licenses.dba,
        licenseType: licenses.licenseType,
        status: licenses.status,
        address: licenses.address,
        city: licenses.city,
        county: licenses.county,
        zip: licenses.zip,
        ownerName: licenses.ownerName,
        issueDate: licenses.issueDate,
        expirationDate: licenses.expirationDate,
      })
      .from(licenses)
      .where(where)
      .limit(10000);

    const csv = Papa.unparse(results);
    const filename = [
      "liquorscope",
      type,
      city,
      county,
      new Date().toISOString().slice(0, 10),
    ]
      .filter(Boolean)
      .join("-");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
