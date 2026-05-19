"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { advanceBracket, recalculateGroupStandings } from "@/lib/match-engine";

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

