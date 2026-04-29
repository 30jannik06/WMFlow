"use client";

import { useState, useTransition } from "react";
import { updateMatchResult, resetMatch } from "@/actions/admin";
import type { Match, Team } from "@/generated/prisma";

type MatchWithTeams = Match & {
  homeTeam: Team | null;
  awayTeam: Team | null;
  winner: Team | null;
};

export default function MatchEditor({ match }: { match: MatchWithTeams }) {
  const [open, setOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? "");
  const [homePen, setHomePen] = useState(match.homePenaltyScore?.toString() ?? "");
  const [awayPen, setAwayPen] = useState(match.awayPenaltyScore?.toString() ?? "");
  const [extraTime, setExtraTime] = useState(match.wentToExtraTime);
  const [penalties, setPenalties] = useState(match.wentToPenalties);
  const [winnerId, setWinnerId] = useState(match.winnerId ?? "");
  const [isPending, startTransition] = useTransition();

  const isGroup = match.phase === "group";
  const isFinished = match.status === "finished";

  const homeName = match.homeTeam?.nameDe ?? match.homePlaceholder ?? "?";
  const awayName = match.awayTeam?.nameDe ?? match.awayPlaceholder ?? "?";
  const homeFlag = match.homeTeam?.flagUrl;
  const awayFlag = match.awayTeam?.flagUrl;

  function handleSave() {
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as)) return;

    let computedWinnerId = winnerId;
    if (isGroup) {
      if (hs > as) computedWinnerId = match.homeTeamId ?? "";
      else if (as > hs) computedWinnerId = match.awayTeamId ?? "";
      else computedWinnerId = "";
    }

    startTransition(async () => {
      await updateMatchResult(match.id, {
        homeScore: hs,
        awayScore: as,
        homePenaltyScore: homePen ? parseInt(homePen) : undefined,
        awayPenaltyScore: awayPen ? parseInt(awayPen) : undefined,
        wentToExtraTime: extraTime,
        wentToPenalties: penalties,
        winnerId: computedWinnerId || undefined,
      });
      setOpen(false);
    });
  }

  function handleReset() {
    startTransition(async () => {
      await resetMatch(match.id);
      setHomeScore("");
      setAwayScore("");
      setHomePen("");
      setAwayPen("");
      setExtraTime(false);
      setPenalties(false);
      setWinnerId("");
    });
  }

  return (
    <div
      className={`rounded-xl border transition-colors ${
        open
          ? "border-white/20 bg-white/[0.04]"
          : isFinished
          ? "border-white/10 bg-white/[0.02]"
          : "border-white/[0.07] bg-transparent"
      }`}
    >
      {/* Row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-4 py-3 cursor-pointer"
      >
        {/* Match number */}
        <span className="text-[10px] text-[var(--muted)] w-5 shrink-0 text-left">
          {match.matchNumber}
        </span>

        {/* Home team */}
        <span className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className="text-sm font-medium truncate text-right">{homeName}</span>
          {homeFlag && (
            <span className={`fi fi-${homeFlag} shrink-0`} style={{ fontSize: "1.1rem" }} />
          )}
        </span>

        {/* Score */}
        <span className="shrink-0 w-16 text-center">
          {isFinished ? (
            <span className="font-mono font-bold text-sm text-[var(--paper)]">
              {match.homeScore} — {match.awayScore}
              {match.wentToPenalties && (
                <span className="block text-[10px] text-[var(--muted)] font-normal leading-none mt-0.5">
                  ({match.homePenaltyScore}:{match.awayPenaltyScore} E)
                </span>
              )}
            </span>
          ) : (
            <span className="text-white/20 font-mono text-sm">vs</span>
          )}
        </span>

        {/* Away team */}
        <span className="flex items-center gap-2 flex-1 min-w-0">
          {awayFlag && (
            <span className={`fi fi-${awayFlag} shrink-0`} style={{ fontSize: "1.1rem" }} />
          )}
          <span className="text-sm font-medium truncate">{awayName}</span>
        </span>

        {/* Status badge */}
        <span
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isFinished
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-white/[0.07] text-[var(--muted)]"
          }`}
        >
          {isFinished ? "✓" : "offen"}
        </span>
      </button>

      {/* Expanded editor */}
      {open && (
        <div className="border-t border-white/10 px-4 py-5 space-y-5">
          {/* Score inputs */}
          <div className="grid grid-cols-[1fr_3rem_1fr] gap-3 items-start">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] text-center">{homeName}</label>
              <input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2.5 text-center font-mono text-2xl font-bold focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="flex items-center justify-center pt-7 text-[var(--muted)] font-mono text-lg">
              :
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[var(--muted)] text-center">{awayName}</label>
              <input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2.5 text-center font-mono text-2xl font-bold focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* KO extras */}
          {!isGroup && (
            <div className="space-y-4">
              <div className="flex gap-5 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={extraTime}
                    onChange={(e) => setExtraTime(e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                  <span className="text-[var(--muted)]">Verlängerung</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={penalties}
                    onChange={(e) => setPenalties(e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                  <span className="text-[var(--muted)]">Elfmeter</span>
                </label>
              </div>

              {penalties && (
                <div className="grid grid-cols-[1fr_3rem_1fr] gap-3 items-center">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={homePen}
                    onChange={(e) => setHomePen(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2 text-center font-mono focus:outline-none focus:border-[var(--accent)]"
                  />
                  <span className="text-center text-[var(--muted)] font-mono">:</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={awayPen}
                    onChange={(e) => setAwayPen(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2 text-center font-mono focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[var(--muted)]">Sieger</label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">— Sieger auswählen —</option>
                  {match.homeTeam && (
                    <option value={match.homeTeamId!}>{homeName}</option>
                  )}
                  {match.awayTeam && (
                    <option value={match.awayTeamId!}>{awayName}</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 justify-end pt-1">
            {isFinished && (
              <button
                onClick={handleReset}
                disabled={isPending}
                className="px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--accent-2)] border border-white/10 hover:border-[var(--accent-2)]/30 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                Zurücksetzen
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-xs text-[var(--muted)] border border-white/10 rounded-lg hover:border-white/25 transition-colors cursor-pointer"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || homeScore === "" || awayScore === ""}
              className="px-5 py-2 text-xs font-bold bg-[var(--accent)] text-[var(--ink)] rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "…" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
