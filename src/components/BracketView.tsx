"use client";

// Visual tournament bracket — 5 rounds left→right, SVG connectors
// Layout maths: SLOT_H doubles each round so cards stay vertically centred

const CARD_H = 64;
const SLOT_H = 80; // slot height in R32; doubles per round
const TOTAL_H = 16 * SLOT_H; // 1280px (all rounds share this height)
const COL_W = 192; // match card column width
const CONN_W = 28; // connector SVG width between columns

// Bracket order: match numbers top-to-bottom in each round.
// Pairs at positions (2i, 2i+1) always feed into position i of the next round.
const ROUNDS: { key: string; label: string; nums: number[] }[] = [
  { key: "r32",   label: "Runde der 32",  nums: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87] },
  { key: "r16",   label: "Achtelfinale",   nums: [89, 90, 93, 94, 91, 92, 95, 96] },
  { key: "qf",    label: "Viertelfinale",  nums: [97, 98, 99, 100] },
  { key: "sf",    label: "Halbfinale",     nums: [101, 102] },
  { key: "final", label: "Finale",         nums: [104] },
];

function slotSize(roundIndex: number) {
  return SLOT_H * Math.pow(2, roundIndex);
}

function cardTop(roundIndex: number, pos: number): number {
  const s = slotSize(roundIndex);
  return pos * s + (s - CARD_H) / 2;
}

function midY(roundIndex: number, pos: number): number {
  return pos * slotSize(roundIndex) + slotSize(roundIndex) / 2;
}

// ── types ────────────────────────────────────────────────────
type Team = { fifaCode: string; nameDe: string; flagUrl: string };
type Match = {
  id: string;
  matchNumber: number;
  phase: string;
  kickoffUtc: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  venue: string;
  city: string;
};

// ── connector SVG ────────────────────────────────────────────
function Connector({ roundIndex }: { roundIndex: number }) {
  const count = ROUNDS[roundIndex].nums.length;
  const halfX = CONN_W / 2;
  const paths: string[] = [];

  for (let i = 0; i < count; i++) {
    const y = midY(roundIndex, i);
    // horizontal stub from card right to halfway
    paths.push(`M 0 ${y} H ${halfX}`);

    if (i % 2 === 0 && i + 1 < count) {
      const y2 = midY(roundIndex, i + 1);
      const yMid = midY(roundIndex + 1, Math.floor(i / 2));
      // vertical join + horizontal into next card
      paths.push(`M ${halfX} ${y} V ${y2} M ${halfX} ${yMid} H ${CONN_W}`);
    }
  }

  return (
    <svg
      width={CONN_W}
      height={TOTAL_H}
      className="flex-shrink-0"
      style={{ overflow: "visible" }}
    >
      <path
        d={paths.join(" ")}
        stroke="currentColor"
        strokeWidth={1}
        fill="none"
        className="text-[var(--ink)]/20"
      />
    </svg>
  );
}

// ── single match card ─────────────────────────────────────────
function BracketCard({
  match,
  roundIndex,
  pos,
  isFinal,
}: {
  match: Match | undefined;
  roundIndex: number;
  pos: number;
  isFinal?: boolean;
}) {
  const top = cardTop(roundIndex, pos);
  const homeName = match?.homeTeam?.nameDe ?? match?.homePlaceholder ?? "?";
  const awayName = match?.awayTeam?.nameDe ?? match?.awayPlaceholder ?? "?";
  const homeFlagUrl = match?.homeTeam?.flagUrl;
  const awayFlagUrl = match?.awayTeam?.flagUrl;
  const played = match?.homeScore !== null && match?.homeScore !== undefined;
  const homeWon = played && (match?.homeScore ?? 0) > (match?.awayScore ?? 0);
  const awayWon = played && (match?.awayScore ?? 0) > (match?.homeScore ?? 0);

  const ring = isFinal
    ? "border-[var(--accent)] border-2 shadow-[0_0_0_1px_var(--accent)]"
    : "border-[var(--ink)]/15";

  return (
    <div
      style={{ position: "absolute", top, left: 0, width: COL_W, height: CARD_H }}
      className={`${ring} bg-[var(--paper)] rounded-sm overflow-hidden flex flex-col`}
    >
      {/* Home */}
      <div className={`flex-1 flex items-center gap-1.5 px-2 min-w-0 ${homeWon ? "bg-[var(--accent)]/15" : ""}`}>
        {homeFlagUrl ? (
          <span className={`fi fi-${homeFlagUrl} flex-shrink-0`} style={{ fontSize: 12 }} />
        ) : (
          <span className="w-4 h-2.5 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
        )}
        <span className={`text-[11px] truncate flex-1 ${homeWon ? "font-bold" : "text-[var(--ink)]/70"}`}>
          {homeName}
        </span>
        {played && (
          <span className={`text-[11px] font-mono flex-shrink-0 ${homeWon ? "font-bold" : ""}`}>
            {match?.homeScore}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--ink)]/8 mx-1.5" />

      {/* Away */}
      <div className={`flex-1 flex items-center gap-1.5 px-2 min-w-0 ${awayWon ? "bg-[var(--accent)]/15" : ""}`}>
        {awayFlagUrl ? (
          <span className={`fi fi-${awayFlagUrl} flex-shrink-0`} style={{ fontSize: 12 }} />
        ) : (
          <span className="w-4 h-2.5 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
        )}
        <span className={`text-[11px] truncate flex-1 ${awayWon ? "font-bold" : "text-[var(--ink)]/70"}`}>
          {awayName}
        </span>
        {played && (
          <span className={`text-[11px] font-mono flex-shrink-0 ${awayWon ? "font-bold" : ""}`}>
            {match?.awayScore}
          </span>
        )}
      </div>
    </div>
  );
}

// ── third place card ──────────────────────────────────────────
function ThirdPlaceCard({ match }: { match: Match | undefined }) {
  if (!match) return null;
  const homeName = match.homeTeam?.nameDe ?? match.homePlaceholder ?? "?";
  const awayName = match.awayTeam?.nameDe ?? match.awayPlaceholder ?? "?";
  const date = new Date(match.kickoffUtc).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mt-10 inline-block">
      <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-[var(--muted)] mb-2">
        Spiel um Platz 3 · {date} · {match.venue}
      </div>
      <div
        className="border border-[var(--ink)]/15 bg-[var(--paper)] rounded-sm overflow-hidden flex flex-col"
        style={{ width: COL_W, height: CARD_H }}
      >
        <div className="flex-1 flex items-center gap-1.5 px-2">
          {match.homeTeam ? (
            <span className={`fi fi-${match.homeTeam.flagUrl} flex-shrink-0`} style={{ fontSize: 12 }} />
          ) : (
            <span className="w-4 h-2.5 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
          <span className="text-[11px] truncate text-[var(--ink)]/70">{homeName}</span>
          {match.homeScore !== null && (
            <span className="text-[11px] font-mono ml-auto">{match.homeScore}</span>
          )}
        </div>
        <div className="h-px bg-[var(--ink)]/8 mx-1.5" />
        <div className="flex-1 flex items-center gap-1.5 px-2">
          {match.awayTeam ? (
            <span className={`fi fi-${match.awayTeam.flagUrl} flex-shrink-0`} style={{ fontSize: 12 }} />
          ) : (
            <span className="w-4 h-2.5 bg-[var(--ink)]/10 rounded-sm flex-shrink-0" />
          )}
          <span className="text-[11px] truncate text-[var(--ink)]/70">{awayName}</span>
          {match.awayScore !== null && (
            <span className="text-[11px] font-mono ml-auto">{match.awayScore}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── main export ───────────────────────────────────────────────
export default function BracketView({
  matchByNum,
  thirdPlace,
}: {
  matchByNum: Record<number, Match>;
  thirdPlace: Match | undefined;
}) {
  const totalWidth =
    ROUNDS.length * COL_W + (ROUNDS.length - 1) * CONN_W;

  return (
    <div>
      {/* Hint for small screens */}
      <p className="text-[10px] font-mono text-[var(--muted)] mb-4 md:hidden">
        ← scrollen für den vollen Bracket
      </p>

      <div className="overflow-x-auto select-none">
        <div style={{ width: totalWidth, position: "relative" }}>
          {/* Column headers */}
          <div className="flex mb-3" style={{ gap: 0 }}>
            {ROUNDS.map((round, ri) => (
              <div
                key={round.key}
                style={{ width: ri < ROUNDS.length - 1 ? COL_W + CONN_W : COL_W, flexShrink: 0 }}
                className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]"
              >
                {round.label}
              </div>
            ))}
          </div>

          {/* Bracket body */}
          <div style={{ position: "relative", height: TOTAL_H }}>
            {ROUNDS.map((round, ri) => {
              const x = ri * (COL_W + CONN_W);
              return (
                <div key={round.key} style={{ position: "absolute", left: x, top: 0 }}>
                  {/* Cards column */}
                  <div style={{ position: "relative", width: COL_W, height: TOTAL_H }}>
                    {round.nums.map((num, pos) => (
                      <BracketCard
                        key={num}
                        match={matchByNum[num]}
                        roundIndex={ri}
                        pos={pos}
                        isFinal={round.key === "final"}
                      />
                    ))}
                  </div>

                  {/* Connector to next round */}
                  {ri < ROUNDS.length - 1 && (
                    <div style={{ position: "absolute", left: COL_W, top: 0 }}>
                      <Connector roundIndex={ri} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ThirdPlaceCard match={thirdPlace} />
    </div>
  );
}
