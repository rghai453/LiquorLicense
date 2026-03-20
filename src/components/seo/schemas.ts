const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barbooktx.com";

export function buildOrganization(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "BarBook Texas",
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    email: "data@barbooktx.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "data@barbooktx.com",
      contactType: "customer service",
    },
    description:
      "Texas liquor license intelligence platform providing searchable TABC data, revenue reports, and violations.",
  };
}

export function buildWebSite(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BarBook Texas",
    url: BASE_URL,
    inLanguage: "en-US",
    description:
      "Search verified Texas liquor licenses with revenue reports, violations, and analytics. Updated daily from TABC public records.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/directory?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "BarBook Texas",
      url: BASE_URL,
      email: "data@barbooktx.com",
    },
  };
}

export function buildBreadcrumbList(
  items: Array<{ name: string; url?: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function buildCollectionPage(opts: {
  name: string;
  description: string;
  url: string;
  about?: Record<string, unknown>;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.about ? { about: opts.about } : {}),
  };
}

export function buildLocalBusiness(license: {
  businessName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  slug: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/licenses/${license.slug}`,
    name: license.businessName,
    url: `${BASE_URL}/licenses/${license.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: license.address,
      addressLocality: license.city,
      addressRegion: license.state,
      postalCode: license.zip,
    },
    ...(license.phone ? { telephone: license.phone } : {}),
    ...(license.latitude && license.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: license.latitude,
            longitude: license.longitude,
          },
        }
      : {}),
  };
}

export function buildDataset(opts: {
  name: string;
  description: string;
  url: string;
  distribution?: { encodingFormat: string; contentUrl: string };
  temporalCoverage?: string;
  spatialCoverage?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.distribution
      ? {
          distribution: {
            "@type": "DataDownload",
            encodingFormat: opts.distribution.encodingFormat,
            contentUrl: opts.distribution.contentUrl,
          },
        }
      : {}),
    ...(opts.temporalCoverage
      ? { temporalCoverage: opts.temporalCoverage }
      : {}),
    ...(opts.spatialCoverage
      ? {
          spatialCoverage: {
            "@type": "Place",
            name: opts.spatialCoverage,
          },
        }
      : {}),
  };
}

export function buildProduct(opts: {
  name: string;
  description: string;
  price: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    offers: {
      "@type": "Offer",
      price: opts.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: opts.url,
    },
  };
}

export function buildFAQPage(
  items: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export { BASE_URL };
