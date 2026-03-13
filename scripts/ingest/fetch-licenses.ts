/**
 * Fetch TABC license data by extracting unique establishments from the
 * Mixed Beverage Gross Receipts dataset on data.texas.gov (Socrata API).
 *
 * Dates come as ISO strings: "2012-08-16T00:00:00.000"
 * County comes as FIPS code (number), not name.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { licenses } from "../../src/db/schema";

const REVENUE_URL = "https://data.texas.gov/resource/naix-2893.json";
const BATCH_SIZE = 5000;

// Texas county FIPS code -> name mapping (partial, most populated)
const COUNTY_FIPS: Record<string, string> = {
  "1": "ANDERSON", "3": "ANGELINA", "5": "ARCHER", "7": "ARANSAS",
  "13": "BEE", "15": "BELL", "21": "BEXAR", "27": "BOWIE",
  "29": "BRAZORIA", "31": "BRAZOS", "35": "BROWN", "37": "BURLESON",
  "39": "CAMERON", "41": "CHAMBERS", "43": "CHEROKEE", "47": "COLLIN",
  "49": "COLORADO", "51": "COMAL", "53": "COOKE", "55": "CORYELL",
  "57": "DALLAS", "61": "DENTON", "63": "DEWITT", "65": "DICKENS",
  "71": "ECTOR", "73": "ELLIS", "75": "EL PASO", "79": "ERATH",
  "85": "FORT BEND", "89": "GALVESTON", "91": "GAINES",
  "97": "GREGG", "99": "GUADALUPE", "101": "HARRIS",
  "105": "HAYS", "107": "HENDERSON", "109": "HIDALGO",
  "113": "HOOD", "115": "HOPKINS", "117": "HOUSTON", "119": "HOWARD",
  "121": "HUNT", "123": "HUTCHINSON", "127": "JEFFERSON",
  "131": "JOHNSON", "133": "JONES", "135": "KAUFMAN",
  "139": "KERR", "141": "KIMBLE", "143": "KENDALL",
  "147": "KLEBERG", "149": "LAMAR", "151": "LAMB",
  "155": "LAVACA", "157": "LEE", "159": "LIBERTY",
  "163": "LUBBOCK", "165": "LYNN", "167": "MADISON",
  "169": "MARION", "171": "MASON", "173": "MATAGORDA",
  "175": "MAVERICK", "177": "MCLENNAN", "179": "MCMULLEN",
  "181": "MEDINA", "183": "MENARD", "185": "MIDLAND",
  "187": "MILAM", "189": "MILLS", "191": "MONTGOMERY",
  "195": "MORRIS", "199": "NAVARRO", "201": "NEWTON",
  "203": "NUECES", "209": "ORANGE", "211": "PALO PINTO",
  "213": "PANOLA", "215": "PARKER", "217": "PARMER",
  "221": "POTTER", "223": "PRESIDIO", "225": "RANDALL",
  "227": "RAINS", "229": "REAGAN", "231": "RED RIVER",
  "233": "REEVES", "237": "ROBERTSON", "239": "ROCKWALL",
  "241": "RUNNELS", "243": "RUSK", "245": "SABINE",
  "247": "SAN AUGUSTINE", "249": "SAN JACINTO", "251": "SAN PATRICIO",
  "253": "SAN SABA", "255": "SCHLEICHER", "257": "SCURRY",
  "259": "SHACKELFORD", "261": "SHELBY", "263": "SHERMAN",
  "265": "SMITH", "271": "STARR", "273": "STEPHENS",
  "277": "TARRANT", "279": "TAYLOR", "281": "TERRELL",
  "283": "TERRY", "285": "THROCKMORTON", "287": "TITUS",
  "289": "TOM GREEN", "291": "TRAVIS", "293": "TRINITY",
  "295": "TYLER", "297": "UPSHUR", "299": "VAL VERDE",
  "301": "VAN ZANDT", "303": "VICTORIA", "305": "WALKER",
  "307": "WALLER", "309": "WARD", "311": "WASHINGTON",
  "313": "WEBB", "315": "WHARTON", "317": "WHEELER",
  "319": "WICHITA", "321": "WILBARGER", "323": "WILLACY",
  "325": "WILLIAMSON", "327": "WILSON", "329": "WINKLER",
  "331": "WISE", "333": "WOOD", "335": "YOAKUM",
};

interface TABCRecord {
  tabc_permit_number?: string;
  location_name?: string;
  taxpayer_name?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_zip?: string;
  location_county?: string;
  responsibility_begin_date_yyyymmdd?: string;
  [key: string]: string | undefined;
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

function parseDate(iso: string | undefined): string | null {
  if (!iso) return null;
  // "2012-08-16T00:00:00.000" -> "2012-08-16"
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

async function fetchLicenses(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  let offset = 0;
  let totalInserted = 0;
  let hasMore = true;
  const seen = new Set<string>();

  console.log("Fetching TABC license data from revenue dataset...\n");

  while (hasMore) {
    const url = `${REVENUE_URL}?$limit=${BATCH_SIZE}&$offset=${offset}&$order=obligation_end_date_yyyymmdd DESC`;
    console.log(`Fetching offset ${offset}...`);

    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const records: TABCRecord[] = await response.json();
    if (records.length === 0) {
      hasMore = false;
      break;
    }

    const rows = [];
    for (const r of records) {
      const permitNumber = (r.tabc_permit_number || "").trim();
      if (!permitNumber || seen.has(permitNumber)) continue;
      seen.add(permitNumber);

      const name = (r.location_name || r.taxpayer_name || "Unknown").trim();
      const slug = slugify(name, permitNumber);
      const countyCode = (r.location_county || "").trim();
      const countyName = COUNTY_FIPS[countyCode] || countyCode;

      rows.push({
        licenseNumber: permitNumber,
        businessName: name,
        dba:
          r.location_name && r.taxpayer_name && r.location_name !== r.taxpayer_name
            ? r.location_name.trim()
            : null,
        licenseType: "Mixed Beverage",
        licenseTypeCode: "MB",
        status: "active",
        issueDate: parseDate(r.responsibility_begin_date_yyyymmdd),
        address: (r.location_address || "").trim() || null,
        city: (r.location_city || "").trim() || null,
        county: countyName,
        state: "TX",
        zip: (r.location_zip || "").trim().slice(0, 5),
        ownerName: (r.taxpayer_name || "").trim() || null,
        slug,
      });
    }

    if (rows.length > 0) {
      const CHUNK = 25;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        await db.insert(licenses).values(chunk).onConflictDoNothing();
      }
      totalInserted += rows.length;
    }

    offset += BATCH_SIZE;
    console.log(
      `  Scanned ${offset} revenue records, found ${totalInserted} unique licenses`
    );

    if (offset >= 200000 || totalInserted >= 50000) {
      hasMore = false;
    }
  }

  console.log(`\nDone! Total unique licenses inserted: ${totalInserted}`);
}

fetchLicenses().catch((err) => {
  console.error("License fetch failed:", err);
  process.exit(1);
});
