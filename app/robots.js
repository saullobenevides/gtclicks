import { MetadataRoute } from "next";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/", "/private/"],
      },
    ],
    sitemap: "https://gtclicks.com.br/sitemap.xml",
  };
}
