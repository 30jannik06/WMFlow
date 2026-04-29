import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchPhase } from "@/generated/prisma";
import MatchEditor from "@/components/admin/MatchEditor";

const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Gruppenphase",
  r32: "Round of 32",
  r16: "Achtelfinale",
  qf: "Viertelfinale",
  sf: "Halbfinale",
  third: "Spiel um Platz 3",
  final: "Finale",
};

const PHASE_ORDER: MatchPhase[] = ["group", "r32", "r16", "qf", "sf", "third", "final"];

export const revalidate = 0;

export default async function AdminPage() {
  const matches = await prisma.match.findMany({
    orderBy: [{ kickoffUtc: "asc" }],
    include: { homeTeam: true, awayTeam: true, winner: true },
  });

  const total = matches.length;
  const finished = matches.filter((m) => m.status === "finished").length;
  const pct = total > 0 ? Math.round((finished / total) * 100) : 0;

  const byPhase = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase],
    matches: matches.filter((m) => m.phase === phase),
  })).filter((g) => g.matches.length > 0);

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-black leading-none">
              wm<span className="text-[var(--accent)]">flow</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="text-sm text-[var(--muted)]">Admin</span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-xs px-3 py-1.5 border border-white/15 rounded-lg text-[var(--muted)] hover:text-[var(--paper)] hover:border-white/30 transition-colors cursor-pointer"
            >
              Abmelden
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Progress stat */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Fortschritt</p>
              <p className="text-3xl font-bold font-mono mt-1">
                {finished}
                <span className="text-lg text-[var(--muted)] font-normal">/{total}</span>
              </p>
              <p className="text-sm text-[var(--muted)] mt-0.5">Spiele eingetragen</p>
            </div>
            <span className="text-4xl font-black font-mono text-[var(--accent)]">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Phase sections */}
        {byPhase.map(({ phase, label, matches }) => {
          const doneInPhase = matches.filter((m) => m.status === "finished").length;
          return (
            <section key={phase}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  {label}
                </h2>
                <span className="text-xs text-[var(--muted)]">
                  {doneInPhase}/{matches.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {matches.map((match) => (
                  <MatchEditor key={match.id} match={match} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
