"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

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

type DayGroup = {
  dateKey: string;
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

function MatchCard({ match }: { match: Match }) {
  const locale = useLocale();
  const tp = useTranslations("phases");
  const tc = useTranslations("common");
  const tg = useTranslations("groups");

  const isKO = match.phase !== "group";
  const group = match.homeTeam?.groupCode ?? "";

  const badgeClass = isKO
    ? "bg-[var(--accent)] text-[#0a1628]"
    : (GROUP_COLORS[group] ?? "bg-[var(--muted)] text-white");
  const badgeLabel = isKO
    ? tp(match.phase as Parameters<typeof tp>[0])
    : `${tg("group")} ${group}`;

  const teamName = (team: Team) => locale === "en" ? team.nameEn : team.nameDe;

  const homeName = match.homeTeam ? teamName(match.homeTeam) : (match.homePlaceholder ?? "?");
  const homeFifa = match.homeTeam?.fifaCode ?? "—";
  const awayName = match.awayTeam ? teamName(match.awayTeam) : (match.awayPlaceholder ?? "?");
  const awayFifa = match.awayTeam?.fifaCode ?? "—";

  const kickoff = new Date(match.kickoffUtc);
  const timeStr = kickoff.toLocaleTimeString(locale === "en" ? "en-US" : "de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  return (
    <div className="bg-white/60 border border-[var(--ink)]/10 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--ink)]/8">
        <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm ${badgeClass}`}>
          {badgeLabel}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.15em] text-[#ff4d2e] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e] animate-pulse" />
              {tc("liveLabel")}
            </span>
          )}
          <span className="text-[10px] font-mono text-[var(--muted)]">
            {isFinished || isLive ? "" : timeStr}
          </span>
        </div>
      </div>

      <div className="px-3 py-3 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 justify-end">
          {match.homeTeam ? (
            <Link
              href={`/teams/${match.homeTeam.fifaCode.toLowerCase()}`}
              className="text-right text-sm font-semibold leading-tight hidden sm:block hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {homeName}
            </Link>
          ) : (
            <span className="text-right text-sm font-semibold leading-tight hidden sm:block">{homeName}</span>
          )}
          <span className="text-right text-xs font-mono text-[var(--muted)] sm:hidden">{homeFifa}</span>
          {match.homeTeam ? (
            <span className={`fi fi-${match.homeTeam.flagUrl} text-xl flex-shrink-0`} />
          ) : (
            <span className="w-6 h-4 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center justify-center w-16 flex-shrink-0">
          {isFinished || isLive ? (
            <span className="text-xl font-black font-mono tabular-nums">
              {match.homeScore ?? 0} : {match.awayScore ?? 0}
            </span>
          ) : (
            <div className="text-center">
              <div className="text-[10px] font-mono text-[var(--muted)] leading-none">{tc("vsLabel")}</div>
              <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5 sm:hidden">{timeStr}</div>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2">
          {match.awayTeam ? (
            <span className={`fi fi-${match.awayTeam.flagUrl} text-xl flex-shrink-0`} />
          ) : (
            <span className="w-6 h-4 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
          {match.awayTeam ? (
            <Link
              href={`/teams/${match.awayTeam.fifaCode.toLowerCase()}`}
              className="text-left text-sm font-semibold leading-tight hidden sm:block hover:underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              {awayName}
            </Link>
          ) : (
            <span className="text-left text-sm font-semibold leading-tight hidden sm:block">{awayName}</span>
          )}
          <span className="text-left text-xs font-mono text-[var(--muted)] sm:hidden">{awayFifa}</span>
        </div>
      </div>

      <div className="px-3 pb-2 text-[10px] font-mono text-[var(--muted)] text-center">
        {match.venue}, {match.city}
      </div>
    </div>
  );
}

function formatDayHeader(dateKey: string, locale: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toLocaleDateString(locale === "en" ? "en-US" : "de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function MatchList({ days }: { days: DayGroup[] }) {
  const locale = useLocale();
  const t = useTranslations("schedule");

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
          <div className="flex items-center gap-4 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)]">
              {formatDayHeader(day.dateKey, locale)}
            </div>
            <div className="flex-1 h-px bg-[var(--ink)]/12" />
            <div className="text-[10px] font-mono text-[var(--muted)]">
              {day.matches.length} {t("matches")}
            </div>
          </div>

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
