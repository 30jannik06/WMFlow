import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import LandingClient, { type UpcomingMatch } from "@/components/LandingClient";

type Params = Promise<{ locale: string }>;

export const revalidate = 120;

export default async function LandingPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const raw = await prisma.match.findMany({
    where: {
      status: "scheduled",
      kickoffUtc: { gte: new Date() },
    },
    orderBy: { kickoffUtc: "asc" },
    take: 3,
    include: { homeTeam: true, awayTeam: true },
  });

  const upcomingMatches: UpcomingMatch[] = raw.map((m) => ({
    id: m.id,
    matchNumber: m.matchNumber,
    kickoffUtc: m.kickoffUtc.toISOString(),
    venue: m.venue,
    city: m.city,
    phase: m.phase,
    homePlaceholder: m.homePlaceholder,
    awayPlaceholder: m.awayPlaceholder,
    homeTeam: m.homeTeam
      ? { nameDe: m.homeTeam.nameDe, nameEn: m.homeTeam.nameEn, flagUrl: m.homeTeam.flagUrl }
      : null,
    awayTeam: m.awayTeam
      ? { nameDe: m.awayTeam.nameDe, nameEn: m.awayTeam.nameEn, flagUrl: m.awayTeam.flagUrl }
      : null,
  }));

  return <LandingClient upcomingMatches={upcomingMatches} />;
}
