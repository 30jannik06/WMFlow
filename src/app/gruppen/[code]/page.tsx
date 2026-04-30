import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

type Params = Promise<{ code: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Gruppe ${code.toUpperCase()} — wmflow`,
    description: `Tabelle und Ergebnisse für Gruppe ${code.toUpperCase()} der FIFA WM 2026.`,
  };
}

const fmt = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function GroupDetailPage({ params }: { params: Params }) {
  const { code } = await params;
  const groupCode = code.toUpperCase();

  const [standings, matches] = await Promise.all([
    prisma.groupStanding.findMany({
      where: { groupCode },
      orderBy: { position: "asc" },
      include: { team: true },
    }),
    prisma.match.findMany({
      where: { phase: "group", homeTeam: { groupCode } },
      orderBy: { kickoffUtc: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
  ]);

  if (standings.length === 0) notFound();

  // Build head-to-head lookup: homeTeamId → awayTeamId → score
  const h2h: Record<string, Record<string, { h: number | null; a: number | null }>> = {};
  for (const m of matches) {
    if (m.homeTeamId && m.awayTeamId) {
      if (!h2h[m.homeTeamId]) h2h[m.homeTeamId] = {};
      h2h[m.homeTeamId][m.awayTeamId] = { h: m.homeScore, a: m.awayScore };
    }
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <Link
            href="/gruppen"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-6"
          >
            ← Gruppen
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
            FIFA World Cup 2026
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-4">
            Gruppe {groupCode}
          </h1>
        </div>

        {/* Nav pills */}
        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/gruppen"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Alle Gruppen
          </Link>
          <Link
            href="/spiele"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Spielplan
          </Link>
          <Link
            href="/bracket"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            KO-Runden
          </Link>
          <Link
            href="/stadien"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Stadien
          </Link>
        </div>

        {/* Standings table */}
        <section className="mb-16">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            Tabelle
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-white/60">
            {/* Big letter background */}
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
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">Sp</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">S</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">U</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">N</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden sm:table-cell">Tore</th>
                  <th className="text-center px-2 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">TD</th>
                  <th className="text-center px-3 py-3 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 font-bold">Pkt</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => {
                  const advances = idx < 2;
                  const third = idx === 2;
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-[var(--ink)]/5 last:border-0 ${advances ? "bg-[var(--accent)]/8" : ""}`}
                    >
                      <td className="px-5 py-3.5 text-xs font-mono text-[var(--ink)]/40">{s.position}</td>
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`fi fi-${s.team.flagUrl} rounded-sm flex-shrink-0`} style={{ fontSize: "1.1rem" }} />
                          <span className="font-medium text-[var(--ink)]">{s.team.nameDe}</span>
                          {advances && (
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--accent-2)]">
                              R32
                            </span>
                          )}
                          {third && (
                            <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--muted)]">
                              evtl.
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
            Spielergebnisse
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
                      {m.homeTeam?.nameDe ?? m.homePlaceholder}
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
                      {m.awayTeam?.nameDe ?? m.awayPlaceholder}
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
              Head-to-Head
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[var(--ink)]/10 bg-white/60 p-4">
              <table className="text-xs font-mono w-full">
                <thead>
                  <tr>
                    <th className="text-right pr-4 pb-3 font-normal text-[var(--ink)]/40 text-[9px] uppercase tracking-[0.15em]">
                      Heim ↓ / Gast →
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
                          <span className="text-[var(--ink)]/80 text-[11px]">{row.team.nameDe}</span>
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
                              won
                                ? "text-[var(--ink)]"
                                : lost
                                ? "text-[var(--muted)]"
                                : "text-[var(--ink)]/60"
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
