import type { Metadata } from "next";

const BRAND = "BarBook Texas";
const TAGLINE = "Texas Liquor License Intelligence";
const BASE_DESCRIPTION =
  "Search, monitor, and analyze Texas liquor licenses, violations, and revenue data.";

interface LicenseMetaInput {
  businessName: string;
  licenseType: string;
  city: string;
  county: string;
  status: string;
}

export function generateLicenseMeta(license: LicenseMetaInput): Metadata {
  const title = `${license.businessName} – ${license.licenseType} License | ${BRAND}`;
  const description = `View ${license.status} ${license.licenseType} license details for ${license.businessName} in ${license.city}, ${license.county} County, Texas. Violations, revenue data, and more.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: BRAND,
    },
    twitter: { card: "summary_large_image" },
  };
}

export function generateCityMeta(city: string, count: number): Metadata {
  const title = `${city}, TX Liquor Licenses (${count.toLocaleString()}) | ${BRAND}`;
  const description = `Browse ${count.toLocaleString()} active liquor licenses in ${city}, Texas. ${TAGLINE}.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: BRAND },
    twitter: { card: "summary_large_image" },
  };
}

export function generateCountyMeta(county: string, count: number): Metadata {
  const title = `${county} County, TX Liquor Licenses (${count.toLocaleString()}) | ${BRAND}`;
  const description = `Browse ${count.toLocaleString()} liquor licenses in ${county} County, Texas. ${TAGLINE}.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: BRAND },
    twitter: { card: "summary_large_image" },
  };
}

export function generateZipMeta(zip: string, count: number): Metadata {
  const title = `ZIP ${zip} Liquor Licenses (${count.toLocaleString()}) | ${BRAND}`;
  const description = `Browse ${count.toLocaleString()} liquor licenses in ZIP code ${zip}, Texas. ${TAGLINE}.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: BRAND },
    twitter: { card: "summary_large_image" },
  };
}

export function generateDirectoryMeta(
  type?: string,
  city?: string,
): Metadata {
  const parts: string[] = [];

  if (type) parts.push(type);
  parts.push("Liquor Licenses");
  if (city) parts.push(`in ${city}, TX`);

  const title = `${parts.join(" ")} | ${BRAND}`;
  const description = type || city
    ? `Browse Texas ${type ?? ""} liquor licenses${city ? ` in ${city}` : ""}. ${TAGLINE}.`
    : `${BASE_DESCRIPTION} ${TAGLINE}.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: BRAND },
    twitter: { card: "summary_large_image" },
  };
}
