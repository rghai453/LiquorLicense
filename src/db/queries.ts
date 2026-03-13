import { db } from "@/db";
import { licenses, revenue, violations } from "@/db/schema";
import {
  sql,
  desc,
  count,
  sum,
  eq,
  ilike,
  and,
  type SQL,
} from "drizzle-orm";

// Only show active licenses, with revenue data surfaced first
const activeOnly = sql`LOWER(${licenses.status}) = 'active'`;
const hasRevenueFirst = sql`CASE WHEN ${licenses.id} IN (SELECT DISTINCT license_id FROM revenue WHERE license_id IS NOT NULL) THEN 0 ELSE 1 END`;

// ============ TYPES ============

export interface HomeStats {
  totalLicenses: number;
  totalCities: number;
  totalCounties: number;
  totalRevenue: number;
}

export interface CityCount {
  city: string;
  count: number;
}

export interface RecentLicense {
  businessName: string;
  city: string;
  licenseType: string;
  slug: string;
}

export interface DirectoryFilters {
  q?: string;
  type?: string;
  city?: string;
  county?: string;
  status?: string;
}

export interface TypeBreakdown {
  type: string;
  count: number;
}

export interface TopRevenueCity {
  city: string | null;
  totalRevenue: string | null;
  count: number;
}

export interface TopRevenueEstablishment {
  businessName: string;
  city: string | null;
  totalRevenue: string | null;
}

export interface TopRevenueEstablishmentDetailed {
  businessName: string;
  address: string | null;
  totalRevenue: string | null;
  liquorRevenue: string | null;
  beerRevenue: string | null;
  wineRevenue: string | null;
}

// ============ HOME PAGE QUERIES ============

export async function getHomeStats(): Promise<HomeStats> {
  const activeFilter = sql`lower(${licenses.status}) = 'active'`;

  const [licenseCount] = await db
    .select({ count: count() })
    .from(licenses)
    .where(activeFilter);

  const [cityCount] = await db
    .select({ count: sql<number>`count(distinct ${licenses.city})` })
    .from(licenses)
    .where(activeFilter);

  const [countyCount] = await db
    .select({ count: sql<number>`count(distinct ${licenses.county})` })
    .from(licenses)
    .where(activeFilter);

  const [revenueTotal] = await db
    .select({ total: sum(revenue.totalReceipts) })
    .from(revenue);

  return {
    totalLicenses: licenseCount?.count ?? 0,
    totalCities: Number(cityCount?.count ?? 0),
    totalCounties: Number(countyCount?.count ?? 0),
    totalRevenue: Number(revenueTotal?.total ?? 0),
  };
}

export async function getTopCities(limit = 12): Promise<CityCount[]> {
  const results = await db
    .select({
      city: licenses.city,
      count: count(),
    })
    .from(licenses)
    .where(
      sql`${licenses.city} is not null AND ${licenses.city} != '' AND lower(${licenses.status}) = 'active'`
    )
    .groupBy(licenses.city)
    .orderBy(desc(count()))
    .limit(limit);

  return results.map((r) => ({ city: r.city!, count: r.count }));
}

export async function getRecentLicenses(limit = 8): Promise<RecentLicense[]> {
  const results = await db
    .select({
      businessName: licenses.businessName,
      city: licenses.city,
      licenseType: licenses.licenseType,
      slug: licenses.slug,
    })
    .from(licenses)
    .where(activeOnly)
    .orderBy(hasRevenueFirst, desc(licenses.createdAt))
    .limit(limit);

  return results.map((r) => ({
    businessName: r.businessName,
    city: r.city ?? "",
    licenseType: r.licenseType,
    slug: r.slug,
  }));
}

// ============ LICENSE DETAIL QUERIES ============

export async function getLicenseBySlug(slug: string) {
  const [license] = await db
    .select()
    .from(licenses)
    .where(eq(licenses.slug, slug))
    .limit(1);

  return license ?? null;
}

export async function getLicenseRevenue(licenseId: string) {
  return db
    .select()
    .from(revenue)
    .where(eq(revenue.licenseId, licenseId))
    .orderBy(desc(revenue.reportMonth));
}

export async function getLicenseViolations(licenseId: string) {
  return db
    .select()
    .from(violations)
    .where(eq(violations.licenseId, licenseId))
    .orderBy(desc(violations.date));
}

// ============ NEW APPLICATIONS QUERIES ============

export async function getNewApplications(limit = 50) {
  return db
    .select()
    .from(licenses)
    .where(and(activeOnly, sql`${licenses.issueDate} is not null`))
    .orderBy(desc(licenses.issueDate))
    .limit(limit);
}

export async function getTotalLicenseCount(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(licenses);
  return result?.count ?? 0;
}

// ============ DIRECTORY QUERIES ============

function buildDirectoryWhere(filters: DirectoryFilters): SQL {
  const conditions: SQL[] = [activeOnly];
  if (filters.q) {
    conditions.push(
      sql`(${ilike(licenses.businessName, `%${filters.q}%`)} OR ${ilike(licenses.dba, `%${filters.q}%`)})`
    );
  }
  if (filters.type) {
    conditions.push(ilike(licenses.licenseType, `%${filters.type}%`));
  }
  if (filters.city) {
    conditions.push(ilike(licenses.city, filters.city));
  }
  if (filters.county) {
    conditions.push(ilike(licenses.county, filters.county));
  }
  if (filters.status) {
    conditions.push(ilike(licenses.status, filters.status));
  }
  return and(...conditions)!;
}

export async function getDirectoryResults(
  filters: DirectoryFilters,
  pageSize: number,
  offset: number
) {
  const where = buildDirectoryWhere(filters);

  const [results, [totalResult]] = await Promise.all([
    db
      .select()
      .from(licenses)
      .where(where)
      .orderBy(hasRevenueFirst, desc(licenses.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(licenses).where(where),
  ]);

  return { results, total: totalResult?.count ?? 0 };
}

// ============ EXPORT QUERY ============

export async function getExportData(filters: DirectoryFilters) {
  const where = buildDirectoryWhere(filters);

  return db
    .select()
    .from(licenses)
    .where(where)
    .orderBy(hasRevenueFirst, desc(licenses.createdAt));
}

// ============ DATA LIST QUERIES ============

export async function getNewApplicationsExport() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

  return db
    .select()
    .from(licenses)
    .where(
      and(
        activeOnly,
        sql`${licenses.issueDate} is not null AND ${licenses.issueDate} >= ${cutoff}`
      )
    )
    .orderBy(desc(licenses.issueDate));
}

export async function getActiveBarsExport() {
  return db
    .select()
    .from(licenses)
    .where(
      and(
        activeOnly,
        sql`${licenses.licenseType} ILIKE '%mixed beverage%' OR ${licenses.licenseType} ILIKE '%bar%' OR ${licenses.licenseType} ILIKE '%late hours%'`
      )
    )
    .orderBy(desc(licenses.createdAt));
}

export async function getFullDatabaseExport() {
  return db.select().from(licenses).orderBy(desc(licenses.createdAt));
}

// ============ TYPE PAGE QUERIES ============

export async function getLicensesByType(typeName: string, limit = 24) {
  const where = and(activeOnly, ilike(licenses.licenseType, `%${typeName}%`));

  const [results, [totalResult], topCities] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(hasRevenueFirst, desc(licenses.createdAt)).limit(limit),
    db.select({ count: count() }).from(licenses).where(where),
    db
      .select({ city: licenses.city, count: count() })
      .from(licenses)
      .where(where)
      .groupBy(licenses.city)
      .orderBy(desc(count()))
      .limit(12),
  ]);

  return { results, total: totalResult?.count ?? 0, topCities };
}

// ============ TYPE + CITY PAGE QUERIES ============

export async function getLicensesByTypeAndCity(
  typeName: string,
  cityName: string,
  limit = 50
) {
  const where = and(
    activeOnly,
    ilike(licenses.licenseType, `%${typeName}%`),
    ilike(licenses.city, cityName)
  );

  const [results, [totalResult]] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(hasRevenueFirst, desc(licenses.createdAt)).limit(limit),
    db.select({ count: count() }).from(licenses).where(where),
  ]);

  return { results, total: totalResult?.count ?? 0 };
}

// ============ ZIP PAGE QUERIES ============

export async function getLicensesByZip(zip: string, limit = 50) {
  const where = and(activeOnly, eq(licenses.zip, zip));

  const [results, [totalResult]] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(hasRevenueFirst, desc(licenses.createdAt)).limit(limit),
    db.select({ count: count() }).from(licenses).where(where),
  ]);

  return { results, total: totalResult?.count ?? 0 };
}

// ============ CITY PAGE QUERIES ============

export async function getLicensesByCity(cityName: string, limit = 24) {
  const where = and(activeOnly, ilike(licenses.city, cityName));

  const [results, [totalResult], typeBreakdown] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(hasRevenueFirst, desc(licenses.createdAt)).limit(limit),
    db.select({ count: count() }).from(licenses).where(where),
    db
      .select({ type: licenses.licenseType, count: count() })
      .from(licenses)
      .where(where)
      .groupBy(licenses.licenseType)
      .orderBy(desc(count())),
  ]);

  return { results, total: totalResult?.count ?? 0, typeBreakdown };
}

// ============ COUNTY PAGE QUERIES ============

export async function getLicensesByCounty(countyName: string, limit = 24) {
  const where = and(activeOnly, ilike(licenses.county, countyName));

  const [results, [totalResult], cityBreakdown] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(hasRevenueFirst, desc(licenses.createdAt)).limit(limit),
    db.select({ count: count() }).from(licenses).where(where),
    db
      .select({ city: licenses.city, count: count() })
      .from(licenses)
      .where(where)
      .groupBy(licenses.city)
      .orderBy(desc(count()))
      .limit(12),
  ]);

  return { results, total: totalResult?.count ?? 0, cityBreakdown };
}

// ============ REVENUE QUERIES ============

export async function getTopRevenueCities(limit = 20): Promise<TopRevenueCity[]> {
  const results = await db
    .select({
      city: revenue.city,
      totalRevenue: sum(revenue.totalReceipts),
      count: sql<number>`count(distinct ${revenue.businessName})`,
    })
    .from(revenue)
    .where(sql`${revenue.city} is not null AND ${revenue.city} != ''`)
    .groupBy(revenue.city)
    .orderBy(desc(sum(revenue.totalReceipts)))
    .limit(limit);

  return results;
}

export async function getTopRevenueEstablishments(): Promise<TopRevenueEstablishment[]> {
  return db
    .select({
      businessName: revenue.businessName,
      city: revenue.city,
      totalRevenue: sum(revenue.totalReceipts),
    })
    .from(revenue)
    .where(sql`${revenue.businessName} is not null`)
    .groupBy(revenue.businessName, revenue.city)
    .orderBy(desc(sum(revenue.totalReceipts)));
}

export async function getTopRevenueEstablishmentsByCity(
  cityName: string
): Promise<TopRevenueEstablishmentDetailed[]> {
  return db
    .select({
      businessName: revenue.businessName,
      address: revenue.address,
      totalRevenue: sum(revenue.totalReceipts),
      liquorRevenue: sum(revenue.liquorReceipts),
      beerRevenue: sum(revenue.beerReceipts),
      wineRevenue: sum(revenue.wineReceipts),
    })
    .from(revenue)
    .where(ilike(revenue.city, cityName))
    .groupBy(revenue.businessName, revenue.address)
    .orderBy(desc(sum(revenue.totalReceipts)));
}

// ============ OWNER QUERIES ============

export async function getLicensesByOwner(ownerSlug: string) {
  const ownerName = decodeURIComponent(ownerSlug).replace(/-/g, " ");

  const where = and(activeOnly, ilike(licenses.ownerName, ownerName));

  const [results, [totalResult]] = await Promise.all([
    db
      .select()
      .from(licenses)
      .where(where)
      .orderBy(hasRevenueFirst, desc(licenses.createdAt)),
    db.select({ count: count() }).from(licenses).where(where),
  ]);

  return { results, total: totalResult?.count ?? 0, ownerName: results[0]?.ownerName ?? ownerName };
}

// ============ VIOLATIONS QUERIES ============

export async function getRecentViolations(limit = 50) {
  return db
    .select({
      violation: violations,
      license: {
        businessName: licenses.businessName,
        city: licenses.city,
        slug: licenses.slug,
      },
    })
    .from(violations)
    .leftJoin(licenses, eq(violations.licenseId, licenses.id))
    .orderBy(desc(violations.date))
    .limit(limit);
}

