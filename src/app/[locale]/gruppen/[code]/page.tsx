import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { computeBestThirds } from "@/lib/bestThirds";

export const revalidate = 60;

type Params = Promise<{ locale: string; code: string }>;

const GROUP_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export async function generateStaticParams() {
  return ["de", "en"].flatMap((locale) =>
    GROUP_CODES.map((code) => ({ locale, code }))
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { code, locale } = await params;
  const g = code.toUpperCase();
  return locale === "en"
    ? { title: `Group ${g} — wmflow`, description: `Standings and results for Group ${g} of the FIFA World Cup 2026.` }
    : { title: `Gruppe ${g} — wmflow`, description: `Tabelle und Ergebnisse für Gruppe ${g} der FIFA WM 2026.` };
}

export default async function GroupDetailPage({ params }: { params: Params }) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const groupCode = code.toUpperCase();

  const t = await getTranslations("groups");
  const ts = await getTranslations("stats");
  const tn = await getTranslations("nav");

  const isEn = locale === "en";

  const [standings, allStandings, matches] = await Promise.all([
    prisma.groupStanding.findMany({
      where: { groupCode },
      orderBy: { position: "asc" },
      include: { team: true },
    }),
    prisma.groupStanding.findMany({
      select: { position: true, teamId: true, points: true, goalDiff: true, goalsFor: true },
    }),
    prisma.match.findMany({
      where: { phase: "group", homeTeam: { groupCode } },
      orderBy: { kickoffUtc: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
  ]);

  if (standings.length === 0) notFound();

  const bestThirds = computeBestThirds(allStandings);

  const fmt = new Intl.DateTimeFormat(isEn ? "en-US" : "de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const h2h: Record<string, Record<string, { h: number | null; a: number | null }>> = {};
  for (const m of matches) {
    if (m.homeTeamId && m.awayTeamId) {
      if (!h2h[m.homeTeamId]) h2h[m.homeTeamId] = {};
      h2h[m.homeTeamId][m.awayTeamId] = { h: m.homeScore, a: m.awayScore };
    }
  }

  const teamName = (team: { nameDe: string; nameEn: string }) =>
    isEn ? team.nameEn : team.nameDe;

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 md:mb-16">
          <Link
            href="/gruppen"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-6"
          >
            {t("back")}
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            {t("eyebrow")}
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-4">
            {t("group")} {groupCode}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
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
          <Link
            href="/stadien"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            {tn("venues")}
          </Link>
        </div>

        {/* Standings */}
        <section className="mb-16">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            {t("standings")}
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-white/60">
            <div
              aria-hidden
              className="absolute -right-3 -top-4 font-display text-[10rem] font-black leading-none text-[var(--ink)]/[0.04] select-none pointer-events-none"
            >
              {groupCode}
            </div>
            <table className="w-full text-sm relative">
              <thead>
                <tr className="border-b border-[var(--ink)]/10">
                  <th className="text-left px-5 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">#</th>
                  <th className="text-left px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">Team</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("played")}</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("won")}</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("drawn")}</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("lost")}</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden sm:table-cell">{ts("goals")}</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("diff")}</th>
                  <th className="text-center px-3 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 font-bold">{ts("points")}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => {
                  const advances = idx < 2;
                  const isThird = idx === 2;
                  const isBestThird = isThird && bestThirds.has(s.teamId);
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-[var(--ink)]/5 last:border-0 ${advances || isBestThird ? "bg-[var(--accent)]/8" : ""}`}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-[var(--ink)]/40">{s.position}</td>
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`fi fi-${s.team.flagUrl} rounded-sm flex-shrink-0`} style={{ fontSize: "1.1rem" }} />
                          <Link
                            href={`/teams/${s.team.fifaCode.toLowerCase()}`}
                            className="font-medium text-[var(--ink)] hover:underline underline-offset-2"
                          >
                            {teamName(s.team)}
                          </Link>
                          {advances && (
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--accent-2)]">
                              {t("advances")}
                            </span>
                          )}
                          {isBestThird && (
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--muted)]">
                              {t("advancesThird")}
                            </span>
                          )}
                          {isThird && !isBestThird && (
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--muted)]">
                              {t("advancesMaybe")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70">{s.played}</td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70">{s.won}</td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70">{s.drawn}</td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70">{s.lost}</td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70 hidden sm:table-cell">
                        {s.goalsFor}:{s.goalsAgainst}
                      </td>
                      <td className="px-2 py-3.5 text-center text-xs font-mono text-[var(--ink)]/70">
                        {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className={`text-sm font-black font-mono ${advances ? "text-[var(--ink)]" : "text-[var(--ink)]/70"}`}>
                          {s.points}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Match results */}
        <section className="mb-16">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            {t("results")}
          </div>
          <div className="space-y-2">
            {matches.map((m) => {
              const played = m.homeScore !== null && m.awayScore !== null;
              const homeWon = played && m.homeScore! > m.awayScore!;
              const awayWon = played && m.awayScore! > m.homeScore!;
              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-[var(--ink)]/10 bg-white/60 px-4 py-3 flex items-center gap-3"
                >
                  <div className="text-[10px] font-mono text-[var(--muted)] w-28 shrink-0 hidden sm:block">
                    {fmt.format(m.kickoffUtc)}
                  </div>
                  <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                    {m.homeTeam && (
                      <span className={`fi fi-${m.homeTeam.flagUrl} rounded-sm flex-shrink-0`} style={{ fontSize: "1rem" }} />
                    )}
                    <span className={`text-sm truncate ${homeWon ? "font-bold" : "font-medium"}`}>
                      {m.homeTeam ? teamName(m.homeTeam) : m.homePlaceholder}
                    </span>
                  </div>
                  <div className="text-center w-16 shrink-0">
                    {played ? (
                      <span className="font-mono font-black text-sm">
                        {m.homeScore} : {m.awayScore}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-[var(--muted)]">–:–</span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className={`text-sm truncate ${awayWon ? "font-bold" : "font-medium"}`}>
                      {m.awayTeam ? teamName(m.awayTeam) : m.awayPlaceholder}
                    </span>
                    {m.awayTeam && (
                      <span className={`fi fi-${m.awayTeam.flagUrl} rounded-sm flex-shrink-0`} style={{ fontSize: "1rem" }} />
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--ink)]/30 w-14 text-right shrink-0">
                    #{m.matchNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Head-to-head matrix */}
        {matches.some((m) => m.homeScore !== null) && (
          <section>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
              {t("h2h")}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[var(--ink)]/10 bg-white/60 p-4">
              <table className="text-xs font-mono w-full">
                <thead>
                  <tr>
                    <th className="text-right pr-4 pb-3 font-normal text-[var(--ink)]/40 text-[9px] uppercase tracking-[0.15em]">
                      {t("h2hHeader")}
                    </th>
                    {standings.map((s) => (
                      <th key={s.teamId} className="pb-3 px-2 text-center min-w-[64px]">
                        <span className={`fi fi-${s.team.flagUrl} rounded-sm`} style={{ fontSize: "1.1rem" }} />
                        <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--ink)]/50">
                          {s.team.fifaCode}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={row.teamId} className="border-t border-[var(--ink)]/5">
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-[var(--ink)]/80 text-[11px]">{teamName(row.team)}</span>
                          <span className={`fi fi-${row.team.flagUrl} rounded-sm`} style={{ fontSize: "0.9rem" }} />
                        </div>
                      </td>
                      {standings.map((col) => {
                        if (row.teamId === col.teamId) {
                          return (
                            <td key={col.teamId} className="py-3 px-2 text-center bg-[var(--ink)]/[0.04] text-[var(--ink)]/30">
                              —
                            </td>
                          );
                        }
                        const result = h2h[row.teamId]?.[col.teamId];
                        if (!result || result.h === null) {
                          return (
                            <td key={col.teamId} className="py-3 px-2 text-center text-[var(--ink)]/20">
                              ·
                            </td>
                          );
                        }
                        const won = result.h > result.a!;
                        const lost = result.h < result.a!;
                        return (
                          <td
                            key={col.teamId}
                            className={`py-3 px-2 text-center font-bold tabular-nums ${
                              won ? "text-[var(--ink)]" : lost ? "text-[var(--muted)]" : "text-[var(--ink)]/60"
                            }`}
                          >
                            {result.h}:{result.a}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
