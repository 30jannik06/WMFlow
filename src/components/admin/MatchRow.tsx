"use client";

import type { SerializedMatch } from "./types";

type Props = {
  match: SerializedMatch;
  onClick: () => void;
};

export default function MatchRow({ match, onClick }: Props) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  const homeName = match.homeTeam?.nameDe ?? match.homePlaceholder ?? "?";
  const awayName = match.awayTeam?.nameDe ?? match.awayPlaceholder ?? "?";
  const homeFlag = match.homeTeam?.flagUrl;
  const awayFlag = match.awayTeam?.flagUrl;

  const date = new Date(match.kickoffUtc);
  const dateStr = date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Berlin",
  });
  const timeStr = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border transition-all text-left hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.995] cursor-pointer ${
        isLive
          ? "border-red-500/30 bg-red-500/[0.04]"
          : isFinished
          ? "border-white/10 bg-white/[0.02]"
          : "border-white/[0.06] bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Match number + date */}
        <div className="shrink-0 w-[4.5rem] text-left">
          <span className="text-[10px] text-[var(--muted)] font-mono block">
            #{match.matchNumber}
          </span>
          <span className="text-[10px] text-[var(--muted)] block leading-tight">{dateStr}</span>
          <span className="text-[10px] text-[var(--muted)] block leading-tight">{timeStr}</span>
        </div>

        {/* Home team */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="text-sm font-medium truncate text-right">{homeName}</span>
          {homeFlag && (
            <span className={`fi fi-${homeFlag} shrink-0`} style={{ fontSize: "1.1rem" }} />
          )}
        </div>

        {/* Score / vs */}
        <div className="shrink-0 w-14 text-center">
          {isFinished ? (
            <div>
              <span className="font-mono font-bold text-sm">
                {match.homeScore} — {match.awayScore}
              </span>
              {match.wentToPenalties && (
                <span className="block text-[10px] text-[var(--muted)] font-mono leading-none mt-0.5">
                  ({match.homePenaltyScore}:{match.awayPenaltyScore} E)
                </span>
              )}
            </div>
          ) : isLive ? (
            <span className="font-mono font-bold text-sm text-red-400">
              {match.homeScore ?? 0} — {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-white/20 font-mono text-sm">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {awayFlag && (
            <span className={`fi fi-${awayFlag} shrink-0`} style={{ fontSize: "1.1rem" }} />
          )}
          <span className="text-sm font-medium truncate">{awayName}</span>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {isFinished ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium">
              ✓
            </span>
          ) : isLive ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium animate-pulse">
              live
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[var(--muted)]">
              offen
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
