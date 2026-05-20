"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateMatchResult, resetMatch } from "@/actions/admin";
import type { SerializedMatch } from "./types";

type Props = {
  match: SerializedMatch;
  onClose: () => void;
};

export default function MatchEditorModal({ match, onClose }: Props) {
  const [homeScore, setHomeScore] = useState(match.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(match.awayScore?.toString() ?? "");
  const [homePen, setHomePen] = useState(match.homePenaltyScore?.toString() ?? "");
  const [awayPen, setAwayPen] = useState(match.awayPenaltyScore?.toString() ?? "");
  const [extraTime, setExtraTime] = useState(match.wentToExtraTime);
  const [penalties, setPenalties] = useState(match.wentToPenalties);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isGroup = match.phase === "group";
  const isFinished = match.status === "finished";
  const homeName = match.homeTeam?.nameDe ?? match.homePlaceholder ?? "?";
  const awayName = match.awayTeam?.nameDe ?? match.awayPlaceholder ?? "?";
  const homeFlag = match.homeTeam?.flagUrl;
  const awayFlag = match.awayTeam?.flagUrl;

  const date = new Date(match.kickoffUtc);
  const dateLabel = date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  });
  const timeLabel = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });

  // Escape key to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSave = useCallback(() => {
    const hs = parseInt(homeScore);
    const as_ = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as_)) return;

    let winnerId = "";
    if (isGroup) {
      if (hs > as_) winnerId = match.homeTeamId ?? "";
      else if (as_ > hs) winnerId = match.awayTeamId ?? "";
    } else if (!penalties) {
      if (hs > as_) winnerId = match.homeTeamId ?? "";
      else if (as_ > hs) winnerId = match.awayTeamId ?? "";
    } else {
      const hp = parseInt(homePen);
      const ap = parseInt(awayPen);
      if (!isNaN(hp) && !isNaN(ap)) {
        if (hp > ap) winnerId = match.homeTeamId ?? "";
        else if (ap > hp) winnerId = match.awayTeamId ?? "";
      }
    }

    startTransition(async () => {
      await updateMatchResult(match.id, {
        homeScore: hs,
        awayScore: as_,
        homePenaltyScore: homePen ? parseInt(homePen) : undefined,
        awayPenaltyScore: awayPen ? parseInt(awayPen) : undefined,
        wentToExtraTime: extraTime,
        wentToPenalties: penalties,
        winnerId: winnerId || undefined,
      });
      router.refresh();
      onClose();
    });
  }, [homeScore, awayScore, homePen, awayPen, extraTime, penalties, isGroup, match, router, onClose]);

  const handleReset = useCallback(() => {
    startTransition(async () => {
      await resetMatch(match.id);
      router.refresh();
      onClose();
    });
  }, [match.id, router, onClose]);

  // Enter in any input → save
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
      e.preventDefault();
      handleSave();
    }
  }

  const canSave = homeScore !== "" && awayScore !== "" && !isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-[var(--ink)] border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/10">
          <div className="min-w-0 pr-3">
            <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-mono">
              Spiel #{match.matchNumber}
            </p>
            <h2 className="text-sm font-bold mt-0.5 truncate">
              {homeName} vs {awayName}
            </h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              {dateLabel} · {timeLabel} · {match.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--paper)] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Score inputs */}
        <div className="px-5 py-5 space-y-5">
          <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-3 items-start">
            {/* Home */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                {homeFlag && (
                  <span className={`fi fi-${homeFlag}`} style={{ fontSize: "0.9rem" }} />
                )}
                <label className="text-[11px] text-[var(--muted)] truncate">{homeName}</label>
              </div>
              <input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="0"
                autoFocus
                className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-3 text-center font-mono text-2xl font-bold focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center pt-8 text-[var(--muted)] font-mono text-lg">
              :
            </div>

            {/* Away */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                {awayFlag && (
                  <span className={`fi fi-${awayFlag}`} style={{ fontSize: "0.9rem" }} />
                )}
                <label className="text-[11px] text-[var(--muted)] truncate">{awayName}</label>
              </div>
              <input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-3 text-center font-mono text-2xl font-bold focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* KO extras */}
          {!isGroup && (
            <div className="space-y-4 pt-1">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                  <input
                    type="checkbox"
                    checked={extraTime}
                    onChange={(e) => setExtraTime(e.target.checked)}
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                  <span className="text-[var(--muted)]">Verlängerung</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
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
                <div>
                  <p className="text-[11px] text-[var(--muted)] mb-2">Elfmeterschießen</p>
                  <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-3 items-center">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={homePen}
                      onChange={(e) => setHomePen(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2.5 text-center font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <span className="text-center text-[var(--muted)] font-mono">:</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={awayPen}
                      onChange={(e) => setAwayPen(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/15 rounded-lg px-3 py-2.5 text-center font-mono focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 pb-5">
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
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs text-[var(--muted)] border border-white/10 rounded-lg hover:border-white/25 transition-colors cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 text-xs font-bold bg-[var(--accent)] text-[var(--ink)] rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "…" : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
