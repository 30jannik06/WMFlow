import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import SpielFilter from "@/components/SpielFilter";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? { title: "Schedule — wmflow", description: "All 104 matches of the FIFA World Cup 2026 — group stage and knockout rounds." }
    : { title: "Spielplan — wmflow", description: "Alle 104 Spiele der FIFA WM 2026 — Gruppenphase und K.O.-Runden." };
}

export const revalidate = 60;

function serializeMatches<
  T extends {
    kickoffUtc: Date;
    createdAt: Date;
    updatedAt: Date;
    homeTeam: { createdAt: Date; updatedAt: Date } | null;
    awayTeam: { createdAt: Date; updatedAt: Date } | null;
  }
>(matches: T[]) {
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

export default async function SpieleePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("schedule");
  const tn = await getTranslations("nav");

  const matches = await prisma.match.findMany({
    orderBy: { kickoffUtc: "asc" },
    include: { homeTeam: true, awayTeam: true },
  });

  const serialized = serializeMatches(matches);

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
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
          <p className="text-sm font-mono text-[var(--muted)]">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/gruppen"
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-3 py-1.5 rounded-sm hover:border-[var(--ink)]/50"
          >
            {tn("groups")}
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            {tn("schedule")}
          </span>
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

        <SpielFilter matches={serialized} />
      </div>
    </main>
  );
}
