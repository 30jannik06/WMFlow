import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchPhase } from "@/generated/prisma";
import AdminClient from "@/components/admin/AdminClient";
import type { SerializedMatch } from "@/components/admin/types";

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

function serializeTeam(team: {
  id: string;
  fifaCode: string;
  nameDe: string;
  nameEn: string;
  flagUrl: string;
  groupCode: string;
  createdAt: Date;
  updatedAt: Date;
} | null) {
  if (!team) return null;
  return { ...team, createdAt: team.createdAt.toISOString(), updatedAt: team.updatedAt.toISOString() };
}

export default async function AdminPage() {
  const matches = await prisma.match.findMany({
    orderBy: [{ kickoffUtc: "asc" }],
    include: { homeTeam: true, awayTeam: true, winner: true },
  });

  const serialized: SerializedMatch[] = matches.map((m) => ({
    ...m,
    kickoffUtc: m.kickoffUtc.toISOString(),
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    homeTeam: serializeTeam(m.homeTeam),
    awayTeam: serializeTeam(m.awayTeam),
    winner: serializeTeam(m.winner),
  }));

  const total = serialized.length;
  const finished = serialized.filter((m) => m.status === "finished").length;

  const byPhase = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase],
    matches: serialized.filter((m) => m.phase === phase),
  })).filter((g) => g.matches.length > 0);

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--ink)]/90 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      <AdminClient byPhase={byPhase} total={total} finished={finished} />
    </main>
  );
}
