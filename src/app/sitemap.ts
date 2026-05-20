import type { MetadataRoute } from "next";

const BASE = "https://wmflow.online";
const LOCALES = ["de", "en"] as const;
const GROUP_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

function localeUrls(path: string, opts?: Partial<MetadataRoute.Sitemap[number]>) {
  return LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified: new Date(),
    ...opts,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const groupDetailPages = GROUP_CODES.flatMap((code) =>
    localeUrls(`/gruppen/${code}`, { changeFrequency: "hourly", priority: 0.8 })
  );

  return [
    // Canonical root → DE default
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...localeUrls("", { changeFrequency: "daily", priority: 0.95 }),

    ...localeUrls("/gruppen", { changeFrequency: "hourly", priority: 0.9 }),
    ...groupDetailPages,

    ...localeUrls("/spiele",  { changeFrequency: "hourly", priority: 0.9 }),
    ...localeUrls("/bracket", { changeFrequency: "hourly", priority: 0.8 }),
    ...localeUrls("/stadien", { changeFrequency: "weekly", priority: 0.6 }),
  ];
}
