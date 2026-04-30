"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export async function updateMatchResult(
  matchId: string,
  data: {
    homeScore: number;
    awayScore: number;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    wentToExtraTime?: boolean;
    wentToPenalties?: boolean;
    winnerId?: string;
  }
) {
  await requireAdmin();

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      homePenaltyScore: data.homePenaltyScore ?? null,
      awayPenaltyScore: data.awayPenaltyScore ?? null,
      wentToExtraTime: data.wentToExtraTime ?? false,
      wentToPenalties: data.wentToPenalties ?? false,
      winnerId: data.winnerId ?? null,
      status: "finished",
    },
    include: { homeTeam: true, awayTeam: true },
  });

  // Gruppenphase: Standings neu berechnen
  if (match.phase === "group" && match.homeTeam && match.awayTeam) {
    await recalculateGroupStandings(match.homeTeam.groupCode);
  }

  // KO-Phase: Sieger ins nächste Match befördern
  if (match.nextMatchId && match.nextSlot && data.winnerId) {
    await advanceBracket(match.nextMatchId, match.nextSlot as "home" | "away", data.winnerId);
  }

  revalidatePath("/admin");
  revalidatePath("/gruppen");
  revalidatePath("/gruppen", "layout");
  revalidatePath("/spiele");
  revalidatePath("/bracket");
  revalidatePath("/");
}

export async function resetMatch(matchId: string) {
  await requireAdmin();

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: null,
      awayScore: null,
      homePenaltyScore: null,
      awayPenaltyScore: null,
      wentToExtraTime: false,
      wentToPenalties: false,
      winnerId: null,
      status: "scheduled",
    },
    include: { homeTeam: true, awayTeam: true },
  });

  // KO-Reset: nächsten Slot leeren
  if (match.nextMatchId && match.nextSlot) {
    await prisma.match.update({
      where: { id: match.nextMatchId },
      data: match.nextSlot === "home" ? { homeTeamId: null } : { awayTeamId: null },
    });
  }

  // Gruppen-Reset: Standings neu berechnen, R32-Slot leeren
  if (match.phase === "group" && match.homeTeam && match.awayTeam) {
    await recalculateGroupStandings(match.homeTeam.groupCode);
  }

  revalidatePath("/admin");
  revalidatePath("/gruppen");
  revalidatePath("/gruppen", "layout");
  revalidatePath("/spiele");
  revalidatePath("/bracket");
  revalidatePath("/");
}

async function advanceBracket(nextMatchId: string, slot: "home" | "away", winnerId: string) {
  await prisma.match.update({
    where: { id: nextMatchId },
    data: slot === "home" ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
  });
}

async function recalculateGroupStandings(groupCode: string) {
  const matches = await prisma.match.findMany({
    where: { phase: "group", status: "finished" },
    include: { homeTeam: true, awayTeam: true },
  });

  const groupMatches = matches.filter(
    (m) => m.homeTeam?.groupCode === groupCode || m.awayTeam?.groupCode === groupCode
  );

  const teams = await prisma.team.findMany({ where: { groupCode } });

  const stats: Record<string, {
    played: number; won: number; drawn: number; lost: number;
    goalsFor: number; goalsAgainst: number; points: number;
  }> = {};

  for (const t of teams) {
    stats[t.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
  }

  for (const m of groupMatches) {
    if (m.homeScore == null || m.awayScore == null) continue;
    if (!m.homeTeamId || !m.awayTeamId) continue;

    const h = stats[m.homeTeamId];
    const a = stats[m.awayTeamId];
    if (!h || !a) continue;

    h.played++;
    a.played++;
    h.goalsFor += m.homeScore;
    h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore;
    a.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      h.won++; h.points += 3;
      a.lost++;
    } else if (m.homeScore < m.awayScore) {
      a.won++; a.points += 3;
      h.lost++;
    } else {
      h.drawn++; h.points++;
      a.drawn++; a.points++;
    }
  }

  const sorted = teams.sort((a, b) => {
    const sa = stats[a.id];
    const sb = stats[b.id];
    if (sb.points !== sa.points) return sb.points - sa.points;
    const gdA = sa.goalsFor - sa.goalsAgainst;
    const gdB = sb.goalsFor - sb.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return sb.goalsFor - sa.goalsFor;
  });

  await Promise.all(
    sorted.map((team, i) =>
      prisma.groupStanding.upsert({
        where: { groupCode_teamId: { groupCode, teamId: team.id } },
        update: {
          position: i + 1,
          ...stats[team.id],
          goalDiff: stats[team.id].goalsFor - stats[team.id].goalsAgainst,
        },
        create: {
          groupCode,
          teamId: team.id,
          position: i + 1,
          ...stats[team.id],
          goalDiff: stats[team.id].goalsFor - stats[team.id].goalsAgainst,
        },
      })
    )
  );

  // Wenn alle 6 Gruppenspiele fertig: 1. + 2. Platz in R32 eintragen
  if (groupMatches.length === 6) {
    await advanceGroupToR32(groupCode, sorted[0]?.id, sorted[1]?.id);
  }
}

async function advanceGroupToR32(
  groupCode: string,
  firstId: string | undefined,
  secondId: string | undefined
) {
  const r32Matches = await prisma.match.findMany({ where: { phase: "r32" } });

  const updates: Promise<unknown>[] = [];

  for (const match of r32Matches) {
    if (firstId) {
      if (match.homePlaceholder === `1. Gruppe ${groupCode}`)
        updates.push(prisma.match.update({ where: { id: match.id }, data: { homeTeamId: firstId } }));
      if (match.awayPlaceholder === `1. Gruppe ${groupCode}`)
        updates.push(prisma.match.update({ where: { id: match.id }, data: { awayTeamId: firstId } }));
    }
    if (secondId) {
      if (match.homePlaceholder === `2. Gruppe ${groupCode}`)
        updates.push(prisma.match.update({ where: { id: match.id }, data: { homeTeamId: secondId } }));
      if (match.awayPlaceholder === `2. Gruppe ${groupCode}`)
        updates.push(prisma.match.update({ where: { id: match.id }, data: { awayTeamId: secondId } }));
    }
  }

  await Promise.all(updates);
}
