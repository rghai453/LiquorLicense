/**
 * Enrich existing licenses and add new ones from the TABC License Information
 * Socrata dataset: https://data.texas.gov/resource/7hf9-qc9f.json
 *
 * Strategy: Pull all records, batch insert new ones, batch update existing via SQL.
 * Also creates violation records for Suspended/Cancelled licenses.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { licenses, violations } from "../../src/db/schema";

const DATASET_URL = "https://data.texas.gov/resource/7hf9-qc9f.json";
const BATCH_SIZE = 5000;
const INSERT_CHUNK = 25;

const LICENSE_TYPE_MAP: Record<string, string> = {
  MB: "Mixed Beverage",
  BQ: "Beer Retail Off-Premise",
  BG: "Beer & Wine Retail",
  NT: "Mixed Beverage Late Hours",
  Q: "Wine Only Package Store",
  S: "Local Cartage",
  P: "Package Store",
  DS: "Local Distributor",
  BE: "Beer Retail On-Premise",
  BN: "Beer & Wine Late Hours",
  G: "Wine & Malt Beverage Retailer",
  C: "Carrier",
  N: "Manufacturer",
  BF: "Brewpub",
  W: "Wholesaler",
  D: "Distributor",
  BW: "Brew Pub",
  NE: "Manufacturer (Non-Resident)",
  PR: "Private Club Registration",
  BB: "Brewpub",
  X: "Mixed Beverage (Private Club)",
  NB: "Nonresident Seller",
  BC: "Beverage Cartage",
  TR: "Temporary",
  FC: "Food & Beverage Certificate",
  "J/JD": "Agent",
  CD: "Certificate of Compliance",
  AW: "Airport Winery",
  ET: "Event",
};

const STATUS_MAP: Record<string, string> = {
  Active: "active",
  "Expired - Original Required": "expired",
  Surrendered: "expired",
  "Temporarily Surrendered": "suspended",
  Expired: "expired",
  Suspended: "suspended",
  Cancelled: "revoked",
};

interface SocrataLicense {
  master_file_id?: string;
  license_type?: string;
  license_id?: string;
  primary_status?: string;
  license_status?: string;
  current_issued_date?: string;
  status_change_date?: string;
  expiration_date?: string;
  trade_name?: string;
  owner?: string;
  original_issue_date?: string;
  tier?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  phone?: string;
  legacy_clp?: string;
}

function parseDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function slugify(name: string, licenseId: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  const id = licenseId.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}-${id}`.slice(0, 200);
}

async function enrich(): Promise<void> {
  const sqlClient = neon(process.env.DATABASE_URL!);
  const db = drizzle(sqlClient);

  // Step 1: Load all existing license numbers into a Set for fast lookup
  console.log("Loading existing license numbers...");
  const existingRows = await sqlClient`SELECT license_number, id FROM licenses`;
  const existingMap = new Map<string, string>();
  for (const row of existingRows) {
    existingMap.set(row.license_number, row.id);
  }
  console.log(`Found ${existingMap.size} existing licenses.\n`);

  let offset = 0;
  let hasMore = true;
  let totalProcessed = 0;
  let newInserted = 0;
  let existingUpdated = 0;
  let violationsCreated = 0;

  while (hasMore) {
    const url = `${DATASET_URL}?$limit=${BATCH_SIZE}&$offset=${offset}&$order=license_id`;
    console.log(`Fetching offset ${offset}...`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const records: SocrataLicense[] = await response.json();
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    const newRows = [];
    const violationRows = [];
    const updateBatch: { licenseNumber: string; type: string; typeCode: string; status: string; county: string; expDate: string | null; phone: string | null }[] = [];

    for (const r of records) {
      const legacyClp = (r.legacy_clp || "").trim();
      const licenseIdNum = (r.license_id || "").replace(/\.0$/, "");
      const licenseNumber = legacyClp || licenseIdNum;
      if (!licenseNumber) continue;

      const name = (r.trade_name || "Unknown").trim();
      const typeCode = (r.license_type || "").trim();
      const typeName = LICENSE_TYPE_MAP[typeCode] || typeCode;
      const rawStatus = (r.primary_status || "Active").trim();
      const normalizedStatus = STATUS_MAP[rawStatus] || "active";
      const county = (r.county || "").trim();
      const city = (r.city || "").trim();
      const zip = (r.zip || "").trim().slice(0, 5);

      if (existingMap.has(licenseNumber)) {
        // Queue for bulk update
        updateBatch.push({
          licenseNumber,
          type: typeName,
          typeCode,
          status: normalizedStatus,
          county,
          expDate: parseDate(r.expiration_date),
          phone: r.phone || null,
        });

        // Create violation if suspended/cancelled
        if (rawStatus === "Suspended" || rawStatus === "Cancelled") {
          violationRows.push({
            licenseId: existingMap.get(licenseNumber)!,
            licenseNumber,
            violationType: rawStatus,
            description: `License ${rawStatus.toLowerCase()} by TABC`,
            date: parseDate(r.status_change_date),
            disposition: rawStatus,
          });
        }
      } else {
        // New license
        const slug = slugify(name, licenseNumber);
        newRows.push({
          licenseNumber,
          businessName: name,
          dba: null,
          licenseType: typeName,
          licenseTypeCode: typeCode,
          status: normalizedStatus,
          issueDate: parseDate(r.original_issue_date || r.current_issued_date),
          expirationDate: parseDate(r.expiration_date),
          address: (r.address || "").trim() || null,
          city: city || null,
          county: county || null,
          state: "TX",
          zip: zip || null,
          phone: r.phone || null,
          ownerName: (r.owner || "").trim() || null,
          slug,
        });

        // Create violation for new suspended/cancelled
        if (rawStatus === "Suspended" || rawStatus === "Cancelled") {
          // We'll link after insert — store by license number
          violationRows.push({
            licenseId: "", // placeholder, will need to link
            licenseNumber,
            violationType: rawStatus,
            description: `License ${rawStatus.toLowerCase()} by TABC`,
            date: parseDate(r.status_change_date),
            disposition: rawStatus,
          });
        }
      }

      totalProcessed++;
    }

    // Bulk update existing licenses via individual SQL updates (batched)
    for (const u of updateBatch) {
      await sqlClient`
        UPDATE licenses SET
          license_type = ${u.type},
          license_type_code = ${u.typeCode},
          status = ${u.status},
          county = COALESCE(NULLIF(${u.county}, ''), county),
          expiration_date = COALESCE(${u.expDate}::date, expiration_date),
          phone = COALESCE(${u.phone}, phone),
          updated_at = NOW()
        WHERE license_number = ${u.licenseNumber}
      `;
    }
    existingUpdated += updateBatch.length;

    // Insert new licenses
    if (newRows.length > 0) {
      for (let i = 0; i < newRows.length; i += INSERT_CHUNK) {
        const chunk = newRows.slice(i, i + INSERT_CHUNK);
        await db.insert(licenses).values(chunk).onConflictDoNothing();
      }
      newInserted += newRows.length;
    }

    // Insert violations (skip ones with empty licenseId — we'll link after)
    const validViolations = violationRows.filter((v) => v.licenseId !== "");
    if (validViolations.length > 0) {
      for (let i = 0; i < validViolations.length; i += INSERT_CHUNK) {
        const chunk = validViolations.slice(i, i + INSERT_CHUNK);
        await db.insert(violations).values(chunk);
      }
      violationsCreated += validViolations.length;
    }

    offset += BATCH_SIZE;
    console.log(
      `  New: ${newInserted} | Updated: ${existingUpdated} | Violations: ${violationsCreated} | Total: ${totalProcessed}`
    );
  }

  // Step 2: Link violations for newly inserted licenses
  console.log("\nLinking violations for new licenses...");
  const [linkResult] = await sqlClient`
    UPDATE violations v
    SET license_id = l.id
    FROM licenses l
    WHERE v.license_number = l.license_number
      AND (v.license_id IS NULL OR v.license_id = '')
  `;

  const [violationCount] = await sqlClient`SELECT count(*) as cnt FROM violations`;

  console.log(`\n--- DONE ---`);
  console.log(`Total Socrata records processed: ${totalProcessed}`);
  console.log(`Existing licenses updated: ${existingUpdated}`);
  console.log(`New licenses inserted: ${newInserted}`);
  console.log(`Total violations in DB: ${violationCount.cnt}`);
}

enrich().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
