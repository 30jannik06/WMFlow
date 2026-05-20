import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? { title: "Venues — wmflow", description: "All 16 host cities of the FIFA World Cup 2026 — USA, Canada and Mexico." }
    : { title: "Stadien — wmflow", description: "Alle 16 Spielorte der FIFA WM 2026 — USA, Kanada und Mexiko." };
}

export const revalidate = 3600;

const VENUE_META: Record<string, { capacity: number; country: "us" | "ca" | "mx"; countryNameDe: string; countryNameEn: string }> = {
  "SoFi Stadium":            { capacity: 70_240, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Gillette Stadium":        { capacity: 65_878, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "NRG Stadium":             { capacity: 72_220, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "MetLife Stadium":         { capacity: 82_500, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "AT&T Stadium":            { capacity: 80_000, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Mercedes-Benz Stadium":   { capacity: 71_000, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Levi's Stadium":          { capacity: 68_500, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Lumen Field":             { capacity: 69_000, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Hard Rock Stadium":       { capacity: 65_326, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Arrowhead Stadium":       { capacity: 76_416, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "Lincoln Financial Field": { capacity: 69_176, country: "us", countryNameDe: "USA",    countryNameEn: "USA" },
  "BMO Field":               { capacity: 45_736, country: "ca", countryNameDe: "Kanada", countryNameEn: "Canada" },
  "BC Place":                { capacity: 54_500, country: "ca", countryNameDe: "Kanada", countryNameEn: "Canada" },
  "Estadio Azteca":          { capacity: 87_523, country: "mx", countryNameDe: "Mexiko", countryNameEn: "Mexico" },
  "Estadio BBVA":            { capacity: 53_500, country: "mx", countryNameDe: "Mexiko", countryNameEn: "Mexico" },
  "Estadio Akron":           { capacity: 49_850, country: "mx", countryNameDe: "Mexiko", countryNameEn: "Mexico" },
};

export default async function StadienPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("venues");
  const tp = await getTranslations("phases");
  const tn = await getTranslations("nav");
  const isEn = locale === "en";

  const matches = await prisma.match.findMany({
    orderBy: { kickoffUtc: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  const byVenue = new Map<string, { city: string; matches: typeof matches }>();
  for (const m of matches) {
    if (!byVenue.has(m.venue)) byVenue.set(m.venue, { city: m.city, matches: [] });
    byVenue.get(m.venue)!.matches.push(m);
  }

  const countryOrder = { mx: 0, ca: 1, us: 2 };
  const venues = [...byVenue.entries()].sort(([aName], [bName]) => {
    const aO = VENUE_META[aName] ? countryOrder[VENUE_META[aName].country] : 3;
    const bO = VENUE_META[bName] ? countryOrder[VENUE_META[bName].country] : 3;
    return aO - bO;
  });

  const totalVenues = venues.length;
  const usCnt = venues.filter(([n]) => VENUE_META[n]?.country === "us").length;
  const caCnt = venues.filter(([n]) => VENUE_META[n]?.country === "ca").length;
  const mxCnt = venues.filter(([n]) => VENUE_META[n]?.country === "mx").length;

  const phaseLabel = (phase: string, groupCode?: string | null) => {
    if (phase === "group") return `${tp("group")}${groupCode ? ` ${groupCode}` : ""}`;
    return tp(phase as Parameters<typeof tp>[0]);
  };

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 md:mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-6"
          >
            {tn("back")}
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            {t("eyebrow")}
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono mt-4">
            {totalVenues} {isEn ? "venues" : "Spielorte"} · {usCnt} USA · {caCnt} {isEn ? "Canada" : "Kanada"} · {mxCnt} {isEn ? "Mexico" : "Mexiko"}
          </p>
        </div>

        <div className="flex gap-3 mb-12 flex-wrap">
          <Link
            href="/gruppen"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            {tn("groups")}
          </Link>
          <Link
            href="/spiele"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            {tn("schedule")}
          </Link>
          <Link
            href="/bracket"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            {tn("knockout")}
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            {tn("venues")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map(([venueName, { city, matches: vMatches }]) => {
            const meta = VENUE_META[venueName];
            const koMatches = vMatches.filter((m) => m.phase !== "group");
            const groupCount = vMatches.length - koMatches.length;
            const isFinalVenue = vMatches.some((m) => m.phase === "final");
            const countryName = isEn ? meta?.countryNameEn : meta?.countryNameDe;

            return (
              <div
                key={venueName}
                className={`border rounded-sm overflow-hidden flex flex-col ${
                  isFinalVenue ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]" : "border-[var(--ink)]/15"
                }`}
              >
                <div className="px-5 pt-5 pb-4 border-b border-[var(--ink)]/8">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {meta && (
                          <span className={`fi fi-${meta.country} flex-shrink-0`} style={{ fontSize: 14 }} />
                        )}
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                          {countryName ?? ""} · {city}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-black leading-tight truncate">{venueName}</h2>
                    </div>
                    {isFinalVenue && (
                      <span className="shrink-0 text-[9px] font-mono uppercase tracking-[0.2em] bg-[var(--accent)] text-[var(--ink)] px-2 py-1 rounded-sm font-bold">
                        {tp("final")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-[11px] font-mono text-[var(--muted)]">
                    <span>{meta ? meta.capacity.toLocaleString(isEn ? "en-US" : "de-DE") : "—"} {t("capacity")}</span>
                    <span>·</span>
                    <span>{vMatches.length} {t("matches")}</span>
                    {groupCount > 0 && <span>· {groupCount} {tp("group")}</span>}
                    {koMatches.length > 0 && <span>· {koMatches.length} KO</span>}
                  </div>
                </div>

                <div className="flex-1 divide-y divide-[var(--ink)]/6">
                  {vMatches.map((m) => {
                    const homeName = isEn
                      ? (m.homeTeam?.nameEn ?? m.homePlaceholder ?? "?")
                      : (m.homeTeam?.nameDe ?? m.homePlaceholder ?? "?");
                    const awayName = isEn
                      ? (m.awayTeam?.nameEn ?? m.awayPlaceholder ?? "?")
                      : (m.awayTeam?.nameDe ?? m.awayPlaceholder ?? "?");
                    const date = new Date(m.kickoffUtc).toLocaleDateString(isEn ? "en-US" : "de-DE", {
                      day: "numeric",
                      month: "short",
                    });
                    const isKO = m.phase !== "group";

                    return (
                      <div key={m.id} className="px-5 py-2.5 flex items-center gap-3">
                        <span className="text-[9px] font-mono text-[var(--muted)] w-16 shrink-0">{date}</span>
                        <span
                          className={`text-[9px] font-mono uppercase tracking-[0.15em] shrink-0 w-20 ${
                            isKO ? "text-[var(--accent-2)]" : "text-[var(--muted)]"
                          }`}
                        >
                          {phaseLabel(m.phase, m.homeTeam?.groupCode)}
                        </span>
                        <span className="text-[11px] truncate text-[var(--ink)]/80 flex-1">
                          {homeName} — {awayName}
                        </span>
                        {m.homeScore !== null && (
                          <span className="text-[11px] font-mono shrink-0 text-[var(--ink)]">
                            {m.homeScore}:{m.awayScore}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
