/**
 * Fetch ALL Mixed Beverage Gross Receipts from 2022 onward
 * Dataset: https://data.texas.gov/dataset/Mixed-Beverage-Gross-Receipts/naix-2893
 * ~1M+ records, ~22K per month
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { revenue } from "../../src/db/schema";
import { sql as dsql } from "drizzle-orm";

const DATASET_URL = "https://data.texas.gov/resource/naix-2893.json";
const BATCH_SIZE = 5000;
const START_DATE = "2022-01-01";

interface SocrataRevenueRecord {
  tabc_permit_number: string;
  taxpayer_name: string;
  location_name: string;
  taxpayer_address: string;
  location_address: string;
  taxpayer_city: string;
  location_city: string;
  taxpayer_zip: string;
  location_zip: string;
  taxpayer_county: string;
  location_county: string;
  obligation_end_date_yyyymmdd: string;
  liquor_receipts: string;
  wine_receipts: string;
  beer_receipts: string;
  cover_charge_receipts: string;
  total_receipts: string;
}

function parseCents(val: string | undefined): number {
  if (!val) return 0;
  return Math.round(parseFloat(val));
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchAllRevenue(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  // Clear existing revenue and re-fetch everything
  console.log("Clearing existing revenue records...");
  await sql`DELETE FROM revenue`;
  console.log("Cleared.\n");

  let offset = 0;
  let totalInserted = 0;

  console.log(`Fetching all revenue from ${START_DATE} onward...`);

  while (true) {
    const url = `${DATASET_URL}?$limit=${BATCH_SIZE}&$offset=${offset}&$order=obligation_end_date_yyyymmdd DESC&$where=obligation_end_date_yyyymmdd>='${START_DATE}'`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Socrata API error: ${response.status} ${response.statusText}`);
    }

    const records: SocrataRevenueRecord[] = await response.json();
    if (records.length === 0) break;

    const rows = records.map((r) => {
      const obligationDate = r.obligation_end_date_yyyymmdd;
      let reportMonth: string;
      if (obligationDate) {
        const match = obligationDate.match(/^(\d{4}-\d{2})/);
        reportMonth = match ? `${match[1]}-01` : "2025-01-01";
      } else {
        reportMonth = "2025-01-01";
      }

      const city = r.location_city || r.taxpayer_city || null;
      const county = r.location_county || r.taxpayer_county || null;

      return {
        licenseNumber: r.tabc_permit_number || null,
        businessName: r.location_name || r.taxpayer_name || "Unknown",
        address: r.location_address || r.taxpayer_address || null,
        city: city ? titleCase(city) : null,
        county: county ? titleCase(county) : null,
        zip: (r.location_zip || r.taxpayer_zip || "").slice(0, 5),
        reportMonth,
        totalReceipts: parseCents(r.total_receipts),
        beerReceipts: parseCents(r.beer_receipts),
        wineReceipts: parseCents(r.wine_receipts),
        liquorReceipts: parseCents(r.liquor_receipts),
        coverChargeReceipts: parseCents(r.cover_charge_receipts),
        totalTax: null,
      };
    });

    // Insert in chunks of 25 (Neon HTTP driver param limit)
    const CHUNK = 25;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      await db.insert(revenue).values(chunk);
    }

    totalInserted += records.length;
    offset += BATCH_SIZE;

    const firstMonth = rows[0]?.reportMonth ?? "?";
    const lastMonth = rows[rows.length - 1]?.reportMonth ?? "?";
    console.log(`  ${totalInserted.toLocaleString()} records (${lastMonth} — ${firstMonth})`);
  }

  // Link revenue to licenses
  console.log("\nLinking revenue records to license profiles...");
  await sql`
    UPDATE revenue r
    SET license_id = l.id
    FROM licenses l
    WHERE r.license_number = l.license_number
      AND r.license_id IS NULL
  `;

  const [linked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NOT NULL`;
  const [unlinked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NULL`;

  console.log(`Linked: ${linked.cnt} | Unlinked: ${unlinked.cnt}`);

  // Get month range
  const months = await sql`SELECT MIN(report_month) as first, MAX(report_month) as last, COUNT(DISTINCT report_month) as cnt FROM revenue`;
  console.log(`\nDone! ${totalInserted.toLocaleString()} total records`);
  console.log(`Months: ${months[0].cnt} (${months[0].first} — ${months[0].last})`);
}

fetchAllRevenue().catch((err) => {
  console.error("Revenue fetch failed:", err);
  process.exit(1);
});
