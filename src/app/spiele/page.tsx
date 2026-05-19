import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MatchList from "@/components/MatchList";

export const metadata: Metadata = {
  title: "Spielplan — wmflow",
  description: "Alle 72 Gruppenspiele der FIFA WM 2026 auf einen Blick.",
};

export const revalidate = 60;

function serializeMatches<T extends { kickoffUtc: Date; createdAt: Date; updatedAt: Date; homeTeam: { createdAt: Date; updatedAt: Date } | null; awayTeam: { createdAt: Date; updatedAt: Date } | null }>(matches: T[]) {
  return matches.map((m) => ({
    ...m,
    kickoffUtc: m.kickoffUtc.toISOString(),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    homeTeam: m.homeTeam
      ? { ...m.homeTeam, createdAt: m.homeTeam.createdAt.toISOString(), updatedAt: m.homeTeam.updatedAt.toISOString() }
      : null,
    awayTeam: m.awayTeam
      ? { ...m.awayTeam, createdAt: m.awayTeam.createdAt.toISOString(), updatedAt: m.awayTeam.updatedAt.toISOString() }
      : null,
  }));
}

function groupByDate<T extends { kickoffUtc: string }>(matches: T[]) {
  const byDate = matches.reduce<Record<string, T[]>>((acc, m) => {
    const key = m.kickoffUtc.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});
  return Object.entries(byDate).map(([dateKey, ms]) => ({ dateKey, matches: ms }));
}

export default async function SpieleePage() {
  const [groupMatches, koMatches] = await Promise.all([
    prisma.match.findMany({
      where: { phase: "group" },
      orderBy: { kickoffUtc: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.match.findMany({
      where: { phase: { not: "group" } },
      orderBy: { kickoffUtc: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
  ]);

  const groupDays = groupByDate(serializeMatches(groupMatches));
  const koDays = groupByDate(serializeMatches(koMatches));

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
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
            Spielplan
          </h1>
          <p className="text-sm font-mono text-[var(--muted)]">
            104 Spiele · 11. Juni – 19. Juli 2026
          </p>
        </div>

        {/* Nav pills */}
        <div className="flex gap-3 mb-10">
          <Link
            href="/gruppen"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Gruppen
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            Spielplan
          </span>
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

        {/* Gruppenphase */}
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--ink)]">
              Gruppenphase
            </h2>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <span className="text-[10px] font-mono text-[var(--muted)]">72 Spiele</span>
          </div>
          <MatchList days={groupDays} />
        </div>

        {/* KO-Phase */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--ink)]">
              K.O.-Phase
            </h2>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <span className="text-[10px] font-mono text-[var(--muted)]">32 Spiele</span>
          </div>
          <MatchList days={koDays} />
        </div>
      </div>
    </main>
  );
}
