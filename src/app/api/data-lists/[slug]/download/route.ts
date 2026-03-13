import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import Papa from "papaparse";
import { stripe } from "@/lib/stripe";
import {
  getNewApplicationsExport,
  getActiveBarsExport,
  getFullDatabaseExport,
} from "@/db/queries";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const LIST_FETCHERS: Record<string, () => ReturnType<typeof getFullDatabaseExport>> = {
  "new-applications": getNewApplicationsExport,
  "active-bars": getActiveBarsExport,
  "full-database": getFullDatabaseExport,
};

const LIST_NAMES: Record<string, string> = {
  "new-applications": "new-applications",
  "active-bars": "active-bar-licenses",
  "full-database": "full-license-database",
};

export async function GET(req: NextRequest, ctx: RouteContext): Promise<Response> {
  const { slug } = await ctx.params;
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    redirect("/pricing");
  }

  const fetcher = LIST_FETCHERS[slug];
  if (!fetcher) {
    redirect("/pricing");
  }

  // Verify the Stripe session is actually paid
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    redirect("/pricing");
  }

  if (session.payment_status !== "paid") {
    redirect("/pricing");
  }

  // Verify the session was for this specific list
  if (session.metadata?.list_slug !== slug) {
    redirect("/pricing");
  }

  const data = await fetcher();

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
  const date = new Date().toISOString().slice(0, 10);
  const filename = `barbooktx-${LIST_NAMES[slug]}-${date}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
