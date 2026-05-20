"use client";

import { useState, useMemo } from "react";
import MatchRow from "./MatchRow";
import MatchEditorModal from "./MatchEditorModal";
import type { SerializedMatch, PhaseGroup } from "./types";

type Props = {
  byPhase: PhaseGroup[];
  total: number;
  finished: number;
};

export default function AdminClient({ byPhase, total, finished }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<SerializedMatch | null>(null);

  const pct = total > 0 ? Math.round((finished / total) * 100) : 0;

  const filteredByPhase = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return byPhase;
    return byPhase
      .map((pg) => ({
        ...pg,
        matches: pg.matches.filter((m) => {
          const home = (m.homeTeam?.nameDe ?? m.homePlaceholder ?? "").toLowerCase();
          const away = (m.awayTeam?.nameDe ?? m.awayPlaceholder ?? "").toLowerCase();
          return (
            home.includes(q) ||
            away.includes(q) ||
            m.matchNumber.toString().includes(q) ||
            m.city.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((pg) => pg.matches.length > 0);
  }, [byPhase, search]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Global progress */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Fortschritt</p>
            <p className="text-3xl font-bold font-mono mt-1">
              {finished}
              <span className="text-lg text-[var(--muted)] font-normal">/{total}</span>
            </p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Spiele eingetragen</p>
          </div>
          <span className="text-4xl font-black font-mono text-[var(--accent)]">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="search"
          placeholder="Team, Spielnummer oder Stadt…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--paper)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--paper)] transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Phase sections */}
      {filteredByPhase.map(({ phase, label, matches }) => {
        const done = matches.filter((m) => m.status === "finished").length;
        const phasePct = matches.length > 0 ? Math.round((done / matches.length) * 100) : 0;

        return (
          <section key={phase}>
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] shrink-0">
                {label}
              </h2>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]/60 transition-all duration-500"
                    style={{ width: `${phasePct}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--muted)] font-mono w-8 text-right">
                  {done}/{matches.length}
                </span>
              </div>
            </div>

            {/* Match rows */}
            <div className="space-y-1">
              {matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {filteredByPhase.length === 0 && (
        <p className="text-center text-[var(--muted)] py-16 text-sm">Keine Spiele gefunden.</p>
      )}

      {/* Modal */}
      {selectedMatch && (
        <MatchEditorModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
