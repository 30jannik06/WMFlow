import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Stadien — wmflow",
  description: "Alle 16 Spielorte der FIFA WM 2026 — USA, Kanada und Mexiko.",
};

export const revalidate = 3600;

// Static lookup: capacity + country per venue
const VENUE_META: Record<string, { capacity: number; country: "us" | "ca" | "mx"; countryName: string }> = {
  "SoFi Stadium":            { capacity: 70_240, country: "us", countryName: "USA" },
  "Gillette Stadium":        { capacity: 65_878, country: "us", countryName: "USA" },
  "NRG Stadium":             { capacity: 72_220, country: "us", countryName: "USA" },
  "MetLife Stadium":         { capacity: 82_500, country: "us", countryName: "USA" },
  "AT&T Stadium":            { capacity: 80_000, country: "us", countryName: "USA" },
  "Mercedes-Benz Stadium":   { capacity: 71_000, country: "us", countryName: "USA" },
  "Levi's Stadium":          { capacity: 68_500, country: "us", countryName: "USA" },
  "Lumen Field":             { capacity: 69_000, country: "us", countryName: "USA" },
  "Hard Rock Stadium":       { capacity: 65_326, country: "us", countryName: "USA" },
  "Arrowhead Stadium":       { capacity: 76_416, country: "us", countryName: "USA" },
  "Lincoln Financial Field": { capacity: 69_176, country: "us", countryName: "USA" },
  "BMO Field":               { capacity: 45_736, country: "ca", countryName: "Kanada" },
  "BC Place":                { capacity: 54_500, country: "ca", countryName: "Kanada" },
  "Estadio Azteca":          { capacity: 87_523, country: "mx", countryName: "Mexiko" },
  "Estadio BBVA":            { capacity: 53_500, country: "mx", countryName: "Mexiko" },
  "Estadio Akron":           { capacity: 49_850, country: "mx", countryName: "Mexiko" },
};

const PHASE_LABEL: Record<string, string> = {
  group: "Gruppe",
  r32:   "R32",
  r16:   "Achtelfinale",
  qf:    "Viertelfinale",
  sf:    "Halbfinale",
  third: "Platz 3",
  final: "Finale",
};

export default async function StadienPage() {
  const matches = await prisma.match.findMany({
    orderBy: { kickoffUtc: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  // Group by venue
  const byVenue = new Map<string, { city: string; matches: typeof matches }>();
  for (const m of matches) {
    if (!byVenue.has(m.venue)) byVenue.set(m.venue, { city: m.city, matches: [] });
    byVenue.get(m.venue)!.matches.push(m);
  }

  // Sort: MX first, then CA, then US (host order); within country by match count desc
  const countryOrder = { mx: 0, ca: 1, us: 2 };
  const venues = [...byVenue.entries()].sort(([aName], [bName]) => {
    const aMeta = VENUE_META[aName];
    const bMeta = VENUE_META[bName];
    const aOrder = aMeta ? countryOrder[aMeta.country] : 3;
    const bOrder = bMeta ? countryOrder[bMeta.country] : 3;
    return aOrder - bOrder;
  });

  const totalVenues = venues.length;
  const usCnt = venues.filter(([n]) => VENUE_META[n]?.country === "us").length;
  const caCnt = venues.filter(([n]) => VENUE_META[n]?.country === "ca").length;
  const mxCnt = venues.filter(([n]) => VENUE_META[n]?.country === "mx").length;

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-6"
          >
            ← wmflow
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            FIFA World Cup 2026
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-4">
            Stadien
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono mt-4">
            {totalVenues} Spielorte · {usCnt} USA · {caCnt} Kanada · {mxCnt} Mexiko
          </p>
        </div>

        {/* Nav pills */}
        <div className="flex gap-3 mb-12 flex-wrap">
          {[
            { href: "/gruppen", label: "Gruppen" },
            { href: "/spiele",  label: "Spielplan" },
            { href: "/bracket", label: "KO-Runden" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Venue grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map(([venueName, { city, matches: vMatches }]) => {
            const meta = VENUE_META[venueName];
            const koMatches = vMatches.filter((m) => m.phase !== "group");
            const groupCount = vMatches.length - koMatches.length;
            const isFinalVenue = vMatches.some((m) => m.phase === "final");

            return (
              <div
                key={venueName}
                className={`border rounded-sm overflow-hidden flex flex-col ${
                  isFinalVenue
                    ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
                    : "border-[var(--ink)]/15"
                }`}
              >
                {/* Top bar */}
                <div className="px-5 pt-5 pb-4 border-b border-[var(--ink)]/8">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {meta && (
                          <span
                            className={`fi fi-${meta.country} flex-shrink-0`}
                            style={{ fontSize: 14 }}
                          />
                        )}
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                          {meta?.countryName ?? ""} · {city}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-black leading-tight truncate">
                        {venueName}
                      </h2>
                    </div>
                    {isFinalVenue && (
                      <span className="shrink-0 text-[9px] font-mono uppercase tracking-[0.2em] bg-[var(--accent)] text-[var(--ink)] px-2 py-1 rounded-sm font-bold">
                        Finale
                      </span>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-4 text-[11px] font-mono text-[var(--muted)]">
                    <span>{meta ? meta.capacity.toLocaleString("de-DE") : "—"} Plätze</span>
                    <span>·</span>
                    <span>{vMatches.length} Spiele</span>
                    {groupCount > 0 && <span>· {groupCount} Gruppe</span>}
                    {koMatches.length > 0 && <span>· {koMatches.length} KO</span>}
                  </div>
                </div>

                {/* Match list */}
                <div className="flex-1 divide-y divide-[var(--ink)]/6">
                  {vMatches.map((m) => {
                    const homeName = m.homeTeam?.nameDe ?? m.homePlaceholder ?? "?";
                    const awayName = m.awayTeam?.nameDe ?? m.awayPlaceholder ?? "?";
                    const date = new Date(m.kickoffUtc).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                    });
                    const isKO = m.phase !== "group";

                    return (
                      <div
                        key={m.id}
                        className="px-5 py-2.5 flex items-center gap-3"
                      >
                        <span className="text-[9px] font-mono text-[var(--muted)] w-16 shrink-0">
                          {date}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase tracking-[0.15em] shrink-0 w-20 ${
                            isKO ? "text-[var(--accent-2)]" : "text-[var(--muted)]"
                          }`}
                        >
                          {PHASE_LABEL[m.phase] ?? m.phase}
                          {m.phase === "group" && m.homeTeam
                            ? ` ${m.homeTeam.groupCode}`
                            : ""}
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
