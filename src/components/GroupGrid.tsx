"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

type Standing = {
  id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  team: {
    fifaCode: string;
    nameDe: string;
    nameEn: string;
    flagUrl: string;
  };
};

type Props = {
  groups: Record<string, Standing[]>;
  bestThirds?: string[];
};

export default function GroupGrid({ groups, bestThirds = [] }: Props) {
  const bestThirdsSet = new Set(bestThirds);
  const groupKeys = Object.keys(groups).sort();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-7">
      {groupKeys.map((code, i) => (
        <motion.div
          key={code}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <GroupCard code={code} standings={groups[code]} bestThirdsSet={bestThirdsSet} />
        </motion.div>
      ))}
    </div>
  );
}

function GroupCard({ code, standings, bestThirdsSet }: { code: string; standings: Standing[]; bestThirdsSet: Set<string> }) {
  const t = useTranslations("groups");
  const ts = useTranslations("stats");
  const locale = useLocale();

  const teamName = (team: { nameDe: string; nameEn: string }) =>
    locale === "en" ? team.nameEn : team.nameDe;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-white/60 backdrop-blur-sm">
      <div
        aria-hidden
        className="absolute -right-3 -top-4 font-display text-[8rem] font-black leading-none text-[var(--ink)]/5 select-none pointer-events-none"
      >
        {code}
      </div>

      <Link
        href={`/gruppen/${code}`}
        className="relative flex items-center gap-3 px-5 py-4 border-b border-[var(--ink)]/10 hover:bg-[var(--ink)]/[0.02] transition-colors"
      >
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent)] text-[var(--ink)] font-mono font-bold text-sm">
          {code}
        </span>
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--ink)]/50">
          {t("group")} {code}
        </span>
        <span className="ml-auto text-[10px] font-mono text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {t("details")}
        </span>
      </Link>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--ink)]/8">
            <th className="text-left px-5 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 w-6">#</th>
            <th className="text-left px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">Team</th>
            <th className="text-center px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40">{ts("played")}</th>
            <th className="text-center px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden sm:table-cell">{ts("won")}</th>
            <th className="text-center px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden sm:table-cell">{ts("drawn")}</th>
            <th className="text-center px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden sm:table-cell">{ts("lost")}</th>
            <th className="text-center px-2 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 hidden md:table-cell">{ts("diff")}</th>
            <th className="text-center px-3 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--ink)]/40 font-bold">{ts("points")}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => {
            const advances = idx < 2;
            const isThird = idx === 2;
            const isBestThird = isThird && bestThirdsSet.has(s.team.fifaCode);
            return (
              <tr
                key={s.id}
                className={`border-b border-[var(--ink)]/5 last:border-0 transition-colors ${advances || isBestThird ? "bg-[var(--accent)]/8" : ""}`}
              >
                <td className="px-5 py-3 text-xs font-mono text-[var(--ink)]/40">{s.position}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`fi fi-${s.team.flagUrl} rounded-sm flex-shrink-0`} style={{ fontSize: "1.1rem" }} />
                    <Link
                      href={`/teams/${s.team.fifaCode.toLowerCase()}`}
                      className="font-medium text-[var(--ink)] text-sm leading-tight hover:underline underline-offset-2"
                    >
                      {teamName(s.team)}
                    </Link>
                    {advances && (
                      <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--accent-2)] hidden lg:inline">
                        {t("advances")}
                      </span>
                    )}
                    {isBestThird && (
                      <span className="ml-auto text-[8px] font-mono uppercase tracking-wide text-[var(--muted)] hidden lg:inline">
                        {t("advancesThird")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-xs font-mono text-[var(--ink)]/70">{s.played}</td>
                <td className="px-2 py-3 text-center text-xs font-mono text-[var(--ink)]/70 hidden sm:table-cell">{s.won}</td>
                <td className="px-2 py-3 text-center text-xs font-mono text-[var(--ink)]/70 hidden sm:table-cell">{s.drawn}</td>
                <td className="px-2 py-3 text-center text-xs font-mono text-[var(--ink)]/70 hidden sm:table-cell">{s.lost}</td>
                <td className="px-2 py-3 text-center text-xs font-mono text-[var(--ink)]/70 hidden md:table-cell">
                  {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-sm font-black font-mono ${advances ? "text-[var(--ink)]" : "text-[var(--ink)]/70"}`}>
                    {s.points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
