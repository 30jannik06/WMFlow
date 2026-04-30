import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BracketView from "@/components/BracketView";

export const metadata: Metadata = {
  title: "KO-Runden — wmflow",
  description: "Der offizielle Turnierbaum der FIFA WM 2026 — Runde der 32 bis Finale.",
};

export const revalidate = 60;

type SerializedTeam = {
  id: string;
  fifaCode: string;
  nameDe: string;
  nameEn: string;
  flagUrl: string;
  groupCode: string;
};

export default async function BracketPage() {
  const koMatches = await prisma.match.findMany({
    where: { phase: { in: ["r32", "r16", "qf", "sf", "third", "final"] } },
    orderBy: { matchNumber: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  const serializeTeam = (t: typeof koMatches[0]["homeTeam"]): SerializedTeam | null => {
    if (!t) return null;
    return { id: t.id, fifaCode: t.fifaCode, nameDe: t.nameDe, nameEn: t.nameEn, flagUrl: t.flagUrl, groupCode: t.groupCode };
  };

  const serialized = koMatches.map((m) => ({
    id: m.id,
    matchNumber: m.matchNumber,
    phase: m.phase,
    kickoffUtc: m.kickoffUtc.toISOString(),
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    homePlaceholder: m.homePlaceholder,
    awayPlaceholder: m.awayPlaceholder,
    venue: m.venue,
    city: m.city,
    homeTeam: serializeTeam(m.homeTeam),
    awayTeam: serializeTeam(m.awayTeam),
  }));

  const matchByNum = Object.fromEntries(serialized.map((m) => [m.matchNumber, m]));
  const thirdPlace = serialized.find((m) => m.phase === "third");

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
            KO-Runden
          </h1>
          <p className="text-sm font-mono text-[var(--muted)]">
            Runde der 32 bis Finale · 28. Juni – 19. Juli 2026
          </p>
        </div>

        {/* Nav pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/gruppen"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Gruppen
          </Link>
          <Link
            href="/spiele"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Spielplan
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            KO-Runden
          </span>
          <Link
            href="/stadien"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            Stadien
          </Link>
        </div>

        <BracketView matchByNum={matchByNum} thirdPlace={thirdPlace} />
      </div>
    </main>
  );
}
