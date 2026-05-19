"use client";

import { motion } from "framer-motion";

type Team = {
  fifaCode: string;
  nameDe: string;
  flagUrl: string;
  groupCode: string;
};

type Match = {
  id: string;
  matchNumber: number;
  phase: string;
  kickoffUtc: string; // ISO string (serialized from Date)
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

type DayGroup = {
  dateKey: string; // "2026-06-11"
  matches: Match[];
};

const GROUP_COLORS: Record<string, string> = {
  A: "bg-[#d4ff3d] text-[#0a1628]",
  B: "bg-[#ff4d2e] text-white",
  C: "bg-[#0a1628] text-white",
  D: "bg-[#6b7280] text-white",
  E: "bg-[#d4ff3d] text-[#0a1628]",
  F: "bg-[#ff4d2e] text-white",
  G: "bg-[#0a1628] text-white",
  H: "bg-[#6b7280] text-white",
  I: "bg-[#d4ff3d] text-[#0a1628]",
  J: "bg-[#ff4d2e] text-white",
  K: "bg-[#0a1628] text-white",
  L: "bg-[#6b7280] text-white",
};

const PHASE_LABELS: Record<string, string> = {
  r32:   "Runde der 32",
  r16:   "Achtelfinale",
  qf:    "Viertelfinale",
  sf:    "Halbfinale",
  final: "Finale",
  third: "Platz 3",
};

function MatchCard({ match }: { match: Match }) {
  const isKO = match.phase !== "group";
  const group = match.homeTeam?.groupCode ?? "";
  const badgeClass = isKO
    ? "bg-[var(--accent)] text-[#0a1628]"
    : (GROUP_COLORS[group] ?? "bg-[var(--muted)] text-white");
  const badgeLabel = isKO
    ? (PHASE_LABELS[match.phase] ?? match.phase)
    : `Gruppe ${group}`;

  const homeName = match.homeTeam?.nameDe ?? match.homePlaceholder ?? "?";
  const homeFifa = match.homeTeam?.fifaCode ?? "—";
  const awayName = match.awayTeam?.nameDe ?? match.awayPlaceholder ?? "?";
  const awayFifa = match.awayTeam?.fifaCode ?? "—";

  const kickoff = new Date(match.kickoffUtc);
  const timeStr = kickoff.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  return (
    <div className="bg-white/60 border border-[var(--ink)]/10 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--ink)]/8">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm ${badgeClass}`}>
          {badgeLabel}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.15em] text-[#ff4d2e] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] animate-pulse" />
              Live
            </span>
          )}
          <span className="text-[10px] font-mono text-[var(--muted)]">
            {isFinished || isLive ? "" : timeStr}
          </span>
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-3 py-3 flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className="text-right text-sm font-semibold leading-tight hidden sm:block">
            {homeName}
          </span>
          <span className="text-right text-xs font-mono text-[var(--muted)] sm:hidden">
            {homeFifa}
          </span>
          {match.homeTeam ? (
            <span className={`fi fi-${match.homeTeam.flagUrl} text-xl flex-shrink-0`} />
          ) : (
            <span className="w-6 h-4 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
        </div>

        {/* Score / Time */}
        <div className="flex items-center justify-center w-16 flex-shrink-0">
          {isFinished || isLive ? (
            <span className="text-xl font-black font-mono tabular-nums">
              {match.homeScore ?? 0} : {match.awayScore ?? 0}
            </span>
          ) : (
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--muted)] leading-none">vs</div>
              <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5 sm:hidden">{timeStr}</div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center gap-2">
          {match.awayTeam ? (
            <span className={`fi fi-${match.awayTeam.flagUrl} text-xl flex-shrink-0`} />
          ) : (
            <span className="w-6 h-4 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
          <span className="text-left text-sm font-semibold leading-tight hidden sm:block">
            {awayName}
          </span>
          <span className="text-left text-xs font-mono text-[var(--muted)] sm:hidden">
            {awayFifa}
          </span>
        </div>
      </div>

      {/* Venue */}
      <div className="px-3 pb-2 text-[10px] font-mono text-[var(--muted)] text-center">
        {match.venue}, {match.city}
      </div>
    </div>
  );
}

const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTH_NAMES = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function formatDayHeader(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return `${DAY_NAMES[d.getUTCDay()]}, ${day}. ${MONTH_NAMES[month - 1]} ${year}`;
}

export default function MatchList({ days }: { days: DayGroup[] }) {
  return (
    <div className="space-y-12">
      {days.map((day, di) => (
        <motion.section
          key={day.dateKey}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: di * 0.04 }}
        >
          {/* Day header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)]">
              {formatDayHeader(day.dateKey)}
            </div>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <div className="text-[10px] font-mono text-[var(--muted)]">
              {day.matches.length} Spiele
            </div>
          </div>

          {/* Match grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {day.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
