import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { computeBestThirds } from "@/lib/bestThirds";
import GroupGrid from "@/components/GroupGrid";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? { title: "Groups — wmflow", description: "All 12 groups of the FIFA World Cup 2026 at a glance." }
    : { title: "Gruppen — wmflow", description: "Alle 12 Gruppen der FIFA WM 2026 auf einen Blick." };
}

export const revalidate = 60;

export default async function GruppenPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("groups");
  const tn = await getTranslations("nav");

  const standings = await prisma.groupStanding.findMany({
    orderBy: [{ groupCode: "asc" }, { position: "asc" }],
    include: { team: true },
  });

  const groups = standings.reduce<Record<string, typeof standings>>((acc, s) => {
    if (!acc[s.groupCode]) acc[s.groupCode] = [];
    acc[s.groupCode].push(s);
    return acc;
  }, {});

  const bestThirds = computeBestThirds(standings);

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
          <p className="text-sm font-mono text-[var(--muted)]">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--ink)] border border-[var(--ink)] px-3 py-1.5 rounded-sm">
            {tn("groups")}
          </span>
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

        <GroupGrid groups={groups} bestThirds={[...bestThirds]} />
      </div>
    </main>
  );
}
