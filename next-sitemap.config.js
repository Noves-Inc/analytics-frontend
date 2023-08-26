/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://www.growthepie.xyz",
  generateRobotsTxt: true,
  exclude: [
    "/blog",
    "/server-sitemap.xml",
  ],
  robotsTxtOptions: {
    exclude: ["/server-sitemap.xml"],
    additionalSitemaps: ["https://www.growthepie.xyz/server-sitemap.xml"],
  },
};
