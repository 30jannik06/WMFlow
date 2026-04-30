import type { MetadataRoute } from "next";

const GROUP_CODES = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://wmflow.online";

  const groupPages = GROUP_CODES.map((code) => ({
    url: `${base}/gruppen/${code}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/gruppen`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...groupPages,
    {
      url: `${base}/spiele`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${base}/bracket`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${base}/stadien`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
