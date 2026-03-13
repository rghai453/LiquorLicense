/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://liquorscope.com",
  generateRobotsTxt: true,
  sitemapSize: 50000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/dashboard/*", "/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/dashboard", "/api"] },
    ],
  },
};
