import type { MetadataRoute } from "next";

import { businessConfig } from "@/data/business";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${businessConfig.siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${businessConfig.siteUrl}/politica-de-privacidad`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${businessConfig.siteUrl}/terminos-y-condiciones`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
