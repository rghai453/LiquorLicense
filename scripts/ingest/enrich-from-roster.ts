/**
 * Enrich license data from TABC Roster file (TABCRoster_*.txt).
 *
 * Parses the CSV roster, matches by License ID → our licenseNumber,
 * and updates: owner name, mailing address, status, expiration date, trade name/DBA.
 * Inserts new licenses not already in DB (with slug generation).
 *
 * Usage: pnpm tsx scripts/ingest/enrich-from-roster.ts [path-to-roster.txt]
 */

import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { licenses } from "../../src/db/schema";

const BATCH_SIZE = 500;

interface RosterRow {
  "Master File ID": string;
  "License Type": string;
  "License ID": string;
  "Primary Status": string;
  "License Status": string;
  "Expiration Date": string;
  "Trade Name": string;
  Owner: string;
  Address: string;
  "Address 2": string;
  City: string;
  State: string;
  ZIP: string;
  Phone: string;
  County: string;
  "Mail Address": string;
  "Mail Address 2": string;
  "Mail City": string;
  "Mail State": string;
  "Mail ZIP": string;
}

function slugify(name: string, licenseNumber: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const id = licenseNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}-${id}`.slice(0, 200);
}

function parseRosterDate(dateStr: string): string | null {
  if (!dateStr) return null;
  // "10/20/2021 12:00:00 AM" -> "2021-10-20"
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

async function enrichFromRoster(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const rosterPath = process.argv[2] || path.resolve(
    process.cwd(),
    "TABCRoster_20260312-203705.txt"
  );

  if (!fs.existsSync(rosterPath)) {
    console.error(`Roster file not found: ${rosterPath}`);
    process.exit(1);
  }

  console.log(`Reading roster from ${rosterPath}...`);
  const content = fs.readFileSync(rosterPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);

  console.log(`Parsed ${lines.length - 1} roster rows`);

  let updated = 0;
  let inserted = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, lines.length);

    for (let j = i; j < batchEnd; j++) {
      const fields = parseCSVLine(lines[j]);
      const row: Record<string, string> = {};
      for (let k = 0; k < headers.length && k < fields.length; k++) {
        row[headers[k]] = fields[k];
      }

      const licenseId = row["License ID"];
      if (!licenseId) {
        skipped++;
        continue;
      }

      const ownerName = row["Owner"] || null;
      const tradeName = row["Trade Name"] || null;
      const businessName = tradeName || ownerName || "";
      const status = (row["Primary Status"] || "active").toLowerCase();
      const expirationDate = parseRosterDate(row["Expiration Date"]);
      const mailAddress = row["Mail Address"] || null;
      const mailCity = row["Mail City"] || null;
      const mailState = row["Mail State"] || null;
      const mailZip = row["Mail ZIP"] || null;
      const address = row["Address"] || null;
      const city = row["City"] || null;
      const state = row["State"] || "TX";
      const zip = row["ZIP"] || null;
      const county = row["County"] || null;
      const licenseType = row["License Type"] || "Unknown";

      const existing = await db
        .select({ id: licenses.id })
        .from(licenses)
        .where(eq(licenses.licenseNumber, licenseId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(licenses)
          .set({
            ...(ownerName && { ownerName }),
            ...(tradeName && { dba: tradeName }),
            ...(expirationDate && { expirationDate }),
            ...(mailAddress && { mailAddress }),
            ...(mailCity && { mailCity }),
            ...(mailState && { mailState }),
            ...(mailZip && { mailZip }),
            status,
            updatedAt: new Date(),
          })
          .where(eq(licenses.licenseNumber, licenseId));
        updated++;
      } else {
        if (!businessName) {
          skipped++;
          continue;
        }

        const slug = slugify(businessName, licenseId);

        await db.insert(licenses).values({
          licenseNumber: licenseId,
          businessName,
          dba: tradeName,
          licenseType,
          status,
          expirationDate,
          address,
          city,
          county,
          state,
          zip,
          ownerName,
          mailAddress,
          mailCity,
          mailState,
          mailZip,
          slug,
        }).onConflictDoNothing();

        inserted++;
      }
    }

    console.log(
      `Progress: ${Math.min(batchEnd, lines.length - 1)}/${lines.length - 1} | Updated: ${updated} | Inserted: ${inserted} | Skipped: ${skipped}`
    );
  }

  console.log(`\nDone! Updated: ${updated}, Inserted: ${inserted}, Skipped: ${skipped}`);
}

enrichFromRoster().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
