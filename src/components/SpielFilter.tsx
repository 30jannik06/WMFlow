"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import MatchList from "./MatchList";

type Team = {
  fifaCode: string;
  nameDe: string;
  nameEn: string;
  flagUrl: string;
  groupCode: string;
};

type Match = {
  id: string;
  matchNumber: number;
  phase: string;
  kickoffUtc: string;
  venue: string;
  city: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
};

type DayGroup = { dateKey: string; matches: Match[] };

function groupByDate(matches: Match[]): DayGroup[] {
  const byDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.kickoffUtc.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});
  return Object.entries(byDate).map(([dateKey, ms]) => ({ dateKey, matches: ms }));
}

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
type Phase = "all" | "group" | "ko";

export default function SpielFilter({ matches }: { matches: Match[] }) {
  const t = useTranslations("schedule");
  const tg = useTranslations("groups");
  const tp = useTranslations("phases");

  const [phase, setPhase] = useState<Phase>("all");
  const [group, setGroup] = useState<string | null>(null);

  function selectPhase(p: Phase) {
    setPhase(p);
    if (p === "ko") setGroup(null);
  }

  const groupMatches = useMemo(() => matches.filter((m) => m.phase === "group"), [matches]);
  const koMatches = useMemo(() => matches.filter((m) => m.phase !== "group"), [matches]);

  const filteredGroup = useMemo(() => {
    if (phase === "ko") return [];
    if (!group) return groupMatches;
    return groupMatches.filter(
      (m) => m.homeTeam?.groupCode === group || m.awayTeam?.groupCode === group
    );
  }, [groupMatches, phase, group]);

  const filteredKo = useMemo(() => (phase === "group" ? [] : koMatches), [koMatches, phase]);

  const groupDays = groupByDate(filteredGroup);
  const koDays = groupByDate(filteredKo);
  const showGroup = filteredGroup.length > 0;
  const showKo = filteredKo.length > 0;

  const phaseOptions: { key: Phase; label: string }[] = [
    { key: "all",   label: t("filterAll") },
    { key: "group", label: t("filterGroup") },
    { key: "ko",    label: t("filterKo") },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {phaseOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => selectPhase(key)}
            className={`text-[11px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm transition-colors border cursor-pointer ${
              phase === key
                ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                : "text-[var(--muted)] border-[var(--ink)]/20 hover:text-[var(--ink)] hover:border-[var(--ink)]/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {phase !== "ko" && (
        <div className="flex flex-wrap gap-1.5 mb-10">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(group === g ? null : g)}
              className={`text-[11px] font-mono w-9 py-1 rounded-sm transition-colors border cursor-pointer ${
                group === g
                  ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] font-bold"
                  : "text-[var(--muted)] border-[var(--ink)]/20 hover:text-[var(--ink)] hover:border-[var(--ink)]/40"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {showGroup && (
        <div className="mb-4">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--ink)]">
              {group ? `${tg("group")} ${group}` : tp("group")}
            </h2>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {filteredGroup.length} {t("matches")}
            </span>
          </div>
          <MatchList days={groupDays} />
        </div>
      )}

      {showKo && (
        <div className={showGroup ? "mt-20" : ""}>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--ink)]">
              {t("filterKo")}
            </h2>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {filteredKo.length} {t("matches")}
            </span>
          </div>
          <MatchList days={koDays} />
        </div>
      )}

      {!showGroup && !showKo && (
        <p className="text-center text-[var(--muted)] py-16 text-sm font-mono">
          —
        </p>
      )}
    </div>
  );
}
