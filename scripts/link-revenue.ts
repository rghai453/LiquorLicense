/**
 * Link revenue records to their license profiles via license_number.
 * Sets revenue.license_id = licenses.id where license_number matches.
 */
import { neon } from "@neondatabase/serverless";

async function linkRevenue(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Linking revenue records to license profiles...");

  const [result] = await sql`
    UPDATE revenue r
    SET license_id = l.id
    FROM licenses l
    WHERE r.license_number = l.license_number
      AND r.license_id IS NULL
  `;

  // Check results
  const [linked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NOT NULL`;
  const [unlinked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NULL`;

  console.log(`Done! Linked: ${linked.cnt}, Still unlinked: ${unlinked.cnt}`);
}

linkRevenue().catch(console.error);
