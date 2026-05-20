export type SerializedTeam = {
  id: string;
  fifaCode: string;
  nameDe: string;
  nameEn: string;
  flagUrl: string;
  groupCode: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializedMatch = {
  id: string;
  matchNumber: number;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
  phase: "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";
  kickoffUtc: string;
  venue: string;
  city: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeam: SerializedTeam | null;
  awayTeam: SerializedTeam | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  winnerId: string | null;
  winner: SerializedTeam | null;
  nextMatchId: string | null;
  nextSlot: string | null;
};

export type PhaseGroup = {
  phase: string;
  label: string;
  matches: SerializedMatch[];
};
