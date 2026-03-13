import { type NextRequest } from "next/server";
import Papa from "papaparse";
import { getExportData } from "@/db/queries";

export async function POST(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const filters = {
    q: searchParams.get("q") || undefined,
    type: searchParams.get("type") || undefined,
    city: searchParams.get("city") || undefined,
    county: searchParams.get("county") || undefined,
    status: searchParams.get("status") || undefined,
  };

  const data = await getExportData(filters);

  const rows = data.map((license) => ({
    license_number: license.licenseNumber,
    business_name: license.businessName,
    dba: license.dba ?? "",
    license_type: license.licenseType,
    status: license.status,
    address: license.address ?? "",
    city: license.city ?? "",
    county: license.county ?? "",
    zip: license.zip ?? "",
    phone: license.phone ?? "",
    email: license.email ?? "",
    owner: license.ownerName ?? "",
    issue_date: license.issueDate ?? "",
    expiration_date: license.expirationDate ?? "",
  }));

  const csv = Papa.unparse(rows);
  const filename = `barbooktx-export-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
