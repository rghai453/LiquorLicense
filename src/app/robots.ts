export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://barbooktx.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/licenses/sitemap.xml`,
      `${baseUrl}/cities/sitemap.xml`,
      `${baseUrl}/counties/sitemap.xml`,
      `${baseUrl}/zip/sitemap.xml`,
    ],
  };
}
