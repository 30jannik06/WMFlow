import { prisma } from "@/lib/prisma";

export async function advanceBracket(nextMatchId: string, slot: "home" | "away", winnerId: string) {
  await prisma.match.update({
    where: { id: nextMatchId },
    data: slot === "home" ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
  });
}

export async function recalculateGroupStandings(groupCode: string) {
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

    h.played++; a.played++;
    h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      h.won++; h.points += 3; a.lost++;
    } else if (m.homeScore < m.awayScore) {
      a.won++; a.points += 3; h.lost++;
    } else {
      h.drawn++; h.points++; a.drawn++; a.points++;
    }
  }

  const sorted = [...teams].sort((a, b) => {
    const sa = stats[a.id], sb = stats[b.id];
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
        update: { position: i + 1, ...stats[team.id], goalDiff: stats[team.id].goalsFor - stats[team.id].goalsAgainst },
        create: { groupCode, teamId: team.id, position: i + 1, ...stats[team.id], goalDiff: stats[team.id].goalsFor - stats[team.id].goalsAgainst },
      })
    )
  );

  // Alle 6 Gruppenspiele fertig → 1. + 2. in R32
  if (groupMatches.filter(m => m.status === "finished").length === 6) {
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
