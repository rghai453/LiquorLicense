import { neon } from "@neondatabase/serverless";

async function check(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);

  const [linked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NOT NULL`;
  const [unlinked] = await sql`SELECT count(*) as cnt FROM revenue WHERE license_id IS NULL`;
  const [totalLic] = await sql`SELECT count(*) as cnt FROM licenses`;
  const [matchable] = await sql`
    SELECT count(DISTINCT r.license_number) as cnt
    FROM revenue r
    INNER JOIN licenses l ON r.license_number = l.license_number
  `;
  const [totalRevPermits] = await sql`SELECT count(DISTINCT license_number) as cnt FROM revenue WHERE license_number IS NOT NULL`;

  console.log("Revenue linked (has license_id):", linked.cnt);
  console.log("Revenue unlinked (no license_id):", unlinked.cnt);
  console.log("Total licenses:", totalLic.cnt);
  console.log("Revenue permits matchable to licenses:", matchable.cnt);
  console.log("Total unique revenue permits:", totalRevPermits.cnt);
}

check().catch(console.error);
