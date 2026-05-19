import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recalculateGroupStandings, advanceBracket } from "@/lib/match-engine";

export const runtime = "nodejs";
export const maxDuration = 30;

const API_BASE = "https://v3.football.api-sports.io";

// API-Football status → unsere MatchStatus enum
function mapStatus(short: string): "scheduled" | "live" | "finished" | "postponed" | "cancelled" {
  if (["1H", "HT", "2H", "ET", "P", "BT", "SUSP", "INT"].includes(short)) return "live";
  if (["FT", "AET", "PEN"].includes(short)) return "finished";
  if (short === "PST") return "postponed";
  if (short === "CANC") return "cancelled";
  return "scheduled";
}

export async function GET(req: Request) {
  // Vercel Cron sendet Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // Nur pollen wenn Matches im aktiven Fenster (angefangen vor max. 4h, oder in nächsten 10min)
  const now = new Date();
  const windowStart = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 10 * 60 * 1000);

  const activeMatches = await prisma.match.findMany({
    where: {
      apiFixtureId: { not: null },
      kickoffUtc: { gte: windowStart, lte: windowEnd },
      status: { in: ["scheduled", "live"] },
    },
    include: { homeTeam: true, awayTeam: true },
  });

  if (activeMatches.length === 0) {
    return Response.json({ skipped: true, reason: "no active match window" });
  }

  // Ein Request für alle laufenden WM-Spiele
  const apiRes = await fetch(
    `${API_BASE}/fixtures?live=all&league=1&season=2026`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY! } }
  );

  if (!apiRes.ok) {
    return Response.json({ error: "API-Football error", status: apiRes.status }, { status: 502 });
  }

  const apiData = await apiRes.json();
  const fixtures: ApiFixture[] = apiData.response ?? [];

  // Für gerade nicht mehr live (kürzlich beendet): zusätzlicher Call mit Fixture-IDs
  const fixtureIds = activeMatches.map((m) => m.apiFixtureId).filter(Boolean).join("-");
  const finishedRes = await fetch(
    `${API_BASE}/fixtures?ids=${fixtureIds}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY! } }
  );
  const finishedData = await finishedRes.json();
  const allFixtures: ApiFixture[] = [
    ...fixtures,
    ...(finishedData.response ?? []),
  ].filter(
    (f, i, arr) => arr.findIndex((x) => x.fixture.id === f.fixture.id) === i
  );

  let updated = 0;

  for (const fix of allFixtures) {
    const match = activeMatches.find((m) => m.apiFixtureId === fix.fixture.id);
    if (!match) continue;

    const statusShort = fix.fixture.status.short as string;
    const status = mapStatus(statusShort);
    const wasFinished = match.status === "finished";

    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeScore:        fix.goals.home,
        awayScore:        fix.goals.away,
        homePenaltyScore: fix.score.penalty.home ?? null,
        awayPenaltyScore: fix.score.penalty.away ?? null,
        wentToExtraTime:  statusShort === "AET" || statusShort === "PEN",
        wentToPenalties:  statusShort === "PEN",
        status,
      },
    });

    // Nachberechnung nur wenn gerade auf "finished" gewechselt
    if (status === "finished" && !wasFinished) {
      if (match.phase === "group" && match.homeTeam) {
        await recalculateGroupStandings(match.homeTeam.groupCode);
      }

      if (match.phase !== "group" && match.nextMatchId && match.nextSlot) {
        // Sieger bestimmen
        const homeGoals = fix.goals.home ?? 0;
        const awayGoals = fix.goals.away ?? 0;
        const homePen   = fix.score.penalty.home ?? 0;
        const awayPen   = fix.score.penalty.away ?? 0;

        let winnerId: string | null = null;
        if (statusShort === "PEN") {
          winnerId = homePen > awayPen ? (match.homeTeamId ?? null) : (match.awayTeamId ?? null);
        } else {
          winnerId = homeGoals > awayGoals ? (match.homeTeamId ?? null) : (match.awayTeamId ?? null);
        }

        if (winnerId) {
          await prisma.match.update({ where: { id: match.id }, data: { winnerId } });
          await advanceBracket(match.nextMatchId, match.nextSlot as "home" | "away", winnerId);
        }
      }
    }

    updated++;
  }

  revalidatePath("/");
  revalidatePath("/spiele");
  revalidatePath("/bracket");
  revalidatePath("/gruppen");
  revalidatePath("/gruppen", "layout");

  return Response.json({
    ok: true,
    checked: activeMatches.length,
    updated,
    ts: now.toISOString(),
  });
}

type ApiFixture = {
  fixture: { id: number; date: string; status: { short: string } };
  goals: { home: number | null; away: number | null };
  score: { penalty: { home: number | null; away: number | null } };
  teams: { home: { id: number }; away: { id: number } };
};
