import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import GroupGrid from "@/components/GroupGrid";

export const metadata: Metadata = {
  title: "Gruppen — wmflow",
  description: "Alle 12 Gruppen der FIFA WM 2026 auf einen Blick.",
};

export const revalidate = 60;

export default async function GruppenPage() {
  const standings = await prisma.groupStanding.findMany({
    orderBy: [{ groupCode: "asc" }, { position: "asc" }],
    include: { team: true },
  });

  const groups = standings.reduce<
    Record<string, typeof standings>
  >((acc, s) => {
    if (!acc[s.groupCode]) acc[s.groupCode] = [];
    acc[s.groupCode].push(s);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
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
            Gruppen
          </h1>
        </div>

        {/* Nav pills */}
        <div className="flex gap-3 mb-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            Gruppen
          </span>
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

        <GroupGrid groups={groups} />
      </div>
    </main>
  );
}
