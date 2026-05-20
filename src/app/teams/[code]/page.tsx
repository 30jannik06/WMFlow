import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

type Params = Promise<{ code: string }>;

const PHASE_LABELS: Record<string, string> = {
  group: "Gruppenphase",
  r32: "Runde der 32",
  r16: "Achtelfinale",
  qf: "Viertelfinale",
  sf: "Halbfinale",
  third: "Spiel um Platz 3",
  final: "Finale",
};

export async function generateStaticParams() {
  const teams = await prisma.team.findMany({ select: { fifaCode: true } });
  return teams.map((t) => ({ code: t.fifaCode.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { code } = await params;
  const team = await prisma.team.findUnique({
    where: { fifaCode: code.toUpperCase() },
  });
  if (!team) return { title: "Team — wmflow" };
  return {
    title: `${team.nameDe} — wmflow`,
    description: `Alle Spiele und Statistiken von ${team.nameDe} bei der FIFA WM 2026.`,
  };
}

export default async function TeamPage({ params }: { params: Params }) {
  const { code } = await params;
  const fifaCode = code.toUpperCase();

  const team = await prisma.team.findUnique({ where: { fifaCode } });
  if (!team) notFound();

  const teamId = team.id;

  const [matches, standing] = await Promise.all([
    prisma.match.findMany({
      where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: { kickoffUtc: "asc" },
      include: { homeTeam: true, awayTeam: true, winner: true },
    }),
    prisma.groupStanding.findFirst({
      where: { teamId },
    }),
  ]);

  const fmt = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function getResult(m: (typeof matches)[number]): "W" | "D" | "L" | null {
    if (m.homeScore === null || m.awayScore === null) return null;
    if (m.phase !== "group" && m.winnerId) {
      return m.winnerId === teamId ? "W" : "L";
    }
    const isHome = m.homeTeamId === teamId;
    const ts = isHome ? m.homeScore : m.awayScore;
    const os = isHome ? m.awayScore : m.homeScore;
    if (ts > os) return "W";
    if (ts < os) return "L";
    return "D";
  }

  const played = matches.filter((m) => m.homeScore !== null);
  const wins = played.filter((m) => getResult(m) === "W").length;
  const draws = played.filter((m) => getResult(m) === "D").length;
  const losses = played.filter((m) => getResult(m) === "L").length;

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <Link
            href="/gruppen"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors mb-6"
          >
            ← Gruppen
          </Link>

          <div className="flex items-start gap-5 mb-4">
            <span
              className={`fi fi-${team.flagUrl} rounded-sm flex-shrink-0`}
              style={{ fontSize: "3.5rem" }}
            />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-1">
                Gruppe {team.groupCode} · FIFA World Cup 2026
              </div>
              <h1 className="font-display text-5xl md:text-7xl font-black leading-[0.9] tracking-tight">
                {team.nameDe}
              </h1>
              <p className="text-sm font-mono text-[var(--muted)] mt-2">{team.fifaCode}</p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        {standing && (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-px bg-[var(--ink)]/10 rounded-2xl overflow-hidden border border-[var(--ink)]/10 mb-12">
            {[
              { label: "Sp", value: standing.played },
              { label: "S", value: standing.won },
              { label: "U", value: standing.drawn },
              { label: "N", value: standing.lost },
              { label: "Tore", value: `${standing.goalsFor}:${standing.goalsAgainst}`, wide: true },
              { label: "TD", value: standing.goalDiff > 0 ? `+${standing.goalDiff}` : standing.goalDiff },
              { label: "Pkt", value: standing.points, accent: true },
            ].map(({ label, value, accent, wide }) => (
              <div
                key={label}
                className={`bg-white/60 px-3 py-4 text-center ${wide ? "hidden sm:block" : ""}`}
              >
                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] mb-1">
                  {label}
                </div>
                <div className={`text-lg font-black font-mono ${accent ? "text-[var(--ink)]" : "text-[var(--ink)]/70"}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Match list */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-6">
            Spiele · {matches.length} gesamt
          </div>

          <div className="space-y-2">
            {matches.map((m) => {
              const isHome = m.homeTeamId === teamId;
              const opponent = isHome ? m.awayTeam : m.homeTeam;
              const oppName = isHome
                ? (m.awayTeam?.nameDe ?? m.awayPlaceholder ?? "?")
                : (m.homeTeam?.nameDe ?? m.homePlaceholder ?? "?");
              const played = m.homeScore !== null && m.awayScore !== null;
              const result = getResult(m);

              const teamScore = played
                ? isHome
                  ? m.homeScore
                  : m.awayScore
                : null;
              const oppScore = played
                ? isHome
                  ? m.awayScore
                  : m.homeScore
                : null;

              const resultColor =
                result === "W"
                  ? "bg-emerald-500/15 text-emerald-700"
                  : result === "L"
                  ? "bg-red-500/10 text-red-700"
                  : result === "D"
                  ? "bg-[var(--ink)]/8 text-[var(--ink)]/60"
                  : "bg-[var(--ink)]/5 text-[var(--muted)]";

              return (
                <div
                  key={m.id}
                  className="rounded-xl border border-[var(--ink)]/10 bg-white/60 px-4 py-3 flex items-center gap-3"
                >
                  {/* Date */}
                  <div className="text-[10px] font-mono text-[var(--muted)] w-28 shrink-0 hidden sm:block">
                    {fmt.format(m.kickoffUtc)}
                  </div>

                  {/* Phase badge */}
                  <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--muted)] bg-[var(--ink)]/5 px-1.5 py-0.5 rounded-sm shrink-0 hidden md:block">
                    {PHASE_LABELS[m.phase] ?? m.phase}
                  </span>

                  {/* Opponent */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                      {isHome ? "H" : "A"}
                    </span>
                    {opponent ? (
                      <Link
                        href={`/teams/${opponent.fifaCode.toLowerCase()}`}
                        className="flex items-center gap-2 min-w-0 hover:underline underline-offset-2"
                      >
                        <span
                          className={`fi fi-${opponent.flagUrl} rounded-sm flex-shrink-0`}
                          style={{ fontSize: "1rem" }}
                        />
                        <span className="text-sm font-semibold truncate">{oppName}</span>
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold truncate text-[var(--muted)]">
                        {oppName}
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-center shrink-0 w-16">
                    {played ? (
                      <span className="font-mono font-black text-sm">
                        {teamScore} : {oppScore}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-[var(--muted)]">–:–</span>
                    )}
                  </div>

                  {/* Result badge */}
                  <div className="shrink-0 w-8 text-center">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${resultColor}`}
                    >
                      {result ?? "–"}
                    </span>
                  </div>

                  {/* Penalties note */}
                  {m.wentToPenalties && (
                    <span className="text-[9px] font-mono text-[var(--muted)] shrink-0 hidden sm:block">
                      i.E.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Summary bar at bottom */}
        {played.length > 0 && (
          <div className="mt-10 flex items-center gap-6 text-sm font-mono text-[var(--muted)]">
            <span>
              <span className="text-emerald-700 font-bold">{wins}S</span>
              {" · "}
              <span className="font-bold text-[var(--ink)]/50">{draws}U</span>
              {" · "}
              <span className="text-red-700 font-bold">{losses}N</span>
            </span>
            {standing && (
              <span>
                {standing.points} Punkte · Platz {standing.position} in Gruppe {team.groupCode}
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
