/**
 * Fetch Mixed Beverage Gross Receipts from data.texas.gov (Socrata API)
 * Dataset: https://data.texas.gov/dataset/Mixed-Beverage-Gross-Receipts/naix-2893
 * No API key needed for public datasets (but rate limited without app token)
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { revenue } from "../../src/db/schema";
import { eq } from "drizzle-orm";

const DATASET_URL =
  "https://data.texas.gov/resource/naix-2893.json";
const BATCH_SIZE = 5000;

interface SocrataRevenueRecord {
  taxpayer_number: string;
  taxpayer_name: string;
  taxpayer_address: string;
  taxpayer_city: string;
  taxpayer_state: string;
  taxpayer_zip: string;
  taxpayer_county: string;
  location_number: string;
  location_name: string;
  location_address: string;
  location_city: string;
  location_state: string;
  location_zip: string;
  location_county: string;
  inside_outside_city_limits_code_y_n: string;
  tabc_permit_number: string;
  responsibility_begin_date_yyyymmdd: string;
  responsibility_end_date_yyyymmdd: string;
  obligation_end_date_yyyymmdd: string;
  liquor_receipts: string;
  wine_receipts: string;
  beer_receipts: string;
  cover_charge_receipts: string;
  total_receipts: string;
}

function parseDollars(val: string | undefined): number {
  if (!val) return 0;
  return Math.round(parseFloat(val) * 100) / 100;
}

async function fetchRevenue(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  let offset = 0;
  let totalInserted = 0;
  let hasMore = true;

  console.log("Starting Mixed Beverage Gross Receipts fetch...");

  while (hasMore) {
    const url = `${DATASET_URL}?$limit=${BATCH_SIZE}&$offset=${offset}&$order=obligation_end_date_yyyymmdd DESC`;
    console.log(`Fetching offset ${offset}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Socrata API error: ${response.status} ${response.statusText}`);
    }

    const records: SocrataRevenueRecord[] = await response.json();

    if (records.length === 0) {
      hasMore = false;
      break;
    }

    const rows = records.map((r) => {
      const obligationDate = r.obligation_end_date_yyyymmdd;
      // Dates come as ISO: "2019-07-31T00:00:00.000" -> extract YYYY-MM-01
      let reportMonth: string;
      if (obligationDate) {
        const match = obligationDate.match(/^(\d{4}-\d{2})/);
        reportMonth = match ? `${match[1]}-01` : new Date().toISOString().slice(0, 10);
      } else {
        reportMonth = new Date().toISOString().slice(0, 10);
      }

      return {
        licenseNumber: r.tabc_permit_number || null,
        businessName: r.location_name || r.taxpayer_name || "Unknown",
        address: r.location_address || r.taxpayer_address || null,
        city: r.location_city || r.taxpayer_city || null,
        county: (r.location_county || r.taxpayer_county || "").toUpperCase(),
        zip: (r.location_zip || r.taxpayer_zip || "").slice(0, 5),
        reportMonth,
        totalReceipts: Math.round(parseDollars(r.total_receipts)),
        beerReceipts: Math.round(parseDollars(r.beer_receipts)),
        wineReceipts: Math.round(parseDollars(r.wine_receipts)),
        liquorReceipts: Math.round(parseDollars(r.liquor_receipts)),
        coverChargeReceipts: Math.round(parseDollars(r.cover_charge_receipts)),
        totalTax: null,
      };
    });

    // Insert in batches
    const CHUNK = 25;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      await db.insert(revenue).values(chunk);
    }

    totalInserted += records.length;
    offset += BATCH_SIZE;

    console.log(`  Inserted ${records.length} records (total: ${totalInserted})`);

    // For initial seed, limit to recent data (last ~2 years worth)
    if (totalInserted >= 100000) {
      console.log("Reached 100K records limit for initial seed.");
      hasMore = false;
    }
  }

  console.log(`\nDone! Total revenue records inserted: ${totalInserted}`);
}

fetchRevenue().catch((err) => {
  console.error("Revenue fetch failed:", err);
  process.exit(1);
});
