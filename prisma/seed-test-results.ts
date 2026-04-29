/**
 * Test-Ergebnisse: Deutschland gewinnt die WM 2026 🏆
 * Setzt alle 104 Match-Ergebnisse (ohne Teams/Gruppen zu löschen).
 * Ausführen:  npx tsx prisma/seed-test-results.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── helper ───────────────────────────────────────────────────
async function id(code: string) {
  const t = await prisma.team.findUnique({ where: { fifaCode: code } });
  if (!t) throw new Error(`Team not found: ${code}`);
  return t.id;
}

async function finishGroup(
  matchNumber: number,
  homeScore: number,
  awayScore: number,
) {
  const m = await prisma.match.findUnique({
    where: { matchNumber },
    select: { homeTeamId: true, awayTeamId: true },
  });
  if (!m) throw new Error(`Match ${matchNumber} not found`);
  const winnerId =
    homeScore > awayScore ? m.homeTeamId
    : awayScore > homeScore ? m.awayTeamId
    : null;
  await prisma.match.update({
    where: { matchNumber },
    data: { homeScore, awayScore, winnerId, status: "finished" },
  });
}

async function finishKO(
  matchNumber: number,
  homeCode: string,
  awayCode: string,
  homeScore: number,
  awayScore: number,
  opts?: { penHome?: number; penAway?: number; aet?: boolean },
) {
  const [homeId, awayId] = await Promise.all([id(homeCode), id(awayCode)]);
  const winnerId =
    homeScore > awayScore ? homeId
    : awayScore > homeScore ? awayId
    : opts?.penHome !== undefined
      ? (opts.penHome > opts.penAway! ? homeId : awayId)
      : homeId; // fallback (draw shouldn't happen in KO without pens)
  await prisma.match.update({
    where: { matchNumber },
    data: {
      homeTeamId:      homeId,
      awayTeamId:      awayId,
      homePlaceholder: null,
      awayPlaceholder: null,
      homeScore,
      awayScore,
      winnerId,
      status:              "finished",
      wentToExtraTime:     opts?.aet ?? false,
      wentToPenalties:     opts?.penHome !== undefined,
      homePenaltyScore:    opts?.penHome ?? null,
      awayPenaltyScore:    opts?.penAway ?? null,
    },
  });
}

// ── standings helper ──────────────────────────────────────────
async function setStanding(
  groupCode: string,
  fifaCode: string,
  pos: number,
  played: number,
  w: number,
  d: number,
  l: number,
  gf: number,
  ga: number,
) {
  const teamId = await id(fifaCode);
  await prisma.groupStanding.update({
    where: { groupCode_teamId: { groupCode, teamId } },
    data: {
      position:     pos,
      played,
      won:          w,
      drawn:        d,
      lost:         l,
      goalsFor:     gf,
      goalsAgainst: ga,
      goalDiff:     gf - ga,
      points:       w * 3 + d,
    },
  });
}

async function main() {
  // ════════════════════════════════════════════════════════════
  // 1) GRUPPENPHASE — nur Gruppe E vollständig (Deutschland)
  //    Die anderen 11 Gruppen bleiben auf 0 (realistisch genug
  //    für den Test, da wir die Teams manuell in KO-Matches setzen)
  // ════════════════════════════════════════════════════════════
  console.log("📊 Gruppe E...");
  //  9: GER 3-0 CUW   34: GER 2-1 CIV   56: ECU 0-1 GER
  // 11: CIV 0-1 ECU   35: ECU 2-0 CUW   55: CUW 0-2 CIV
  await finishGroup( 9, 3, 0); // GER 3-0 CUW
  await finishGroup(11, 0, 1); // CIV 0-1 ECU
  await finishGroup(34, 2, 1); // GER 2-1 CIV
  await finishGroup(35, 2, 0); // ECU 2-0 CUW
  await finishGroup(55, 0, 2); // CUW 0-2 CIV
  await finishGroup(56, 0, 1); // ECU 0-1 GER

  await setStanding("E", "GER", 1, 3, 3, 0, 0, 6, 1);
  await setStanding("E", "ECU", 2, 3, 2, 0, 1, 3, 1);
  await setStanding("E", "CIV", 3, 3, 1, 0, 2, 3, 3);
  await setStanding("E", "CUW", 4, 3, 0, 0, 3, 0, 7);
  console.log("✓ GER 1. · ECU 2. · CIV 3. · CUW 4.");

  // ════════════════════════════════════════════════════════════
  // 2) RUNDE DER 32  (Paarungen laut offiziellem Bracket)
  //    Teams: je 1./2. Gruppe + 8 beste Drittplatzierte
  // ════════════════════════════════════════════════════════════
  console.log("🏆 Runde der 32...");
  // Bracket-Positionen (top→bottom): 74,77,73,75, 83,84,81,82, 76,78,79,80, 86,88,85,87
  await finishKO( 74, "GER", "RSA",  3, 0);          // 1.E vs Best3 → GER ✓
  await finishKO( 77, "FRA", "IRN",  3, 0);          // 1.I vs Best3 → FRA (→ R16-89 mit GER)
  await finishKO( 73, "KOR", "SUI",  1, 0);          // 2.A vs 2.B   → KOR
  await finishKO( 75, "NED", "MAR",  2, 1);          // 1.F vs 2.C   → NED (→ R16-90 mit KOR)
  await finishKO( 83, "COL", "CRO",  2, 0);          // 2.K vs 2.L   → COL
  await finishKO( 84, "ESP", "AUT",  2, 0);          // 1.H vs 2.J   → ESP (→ R16-93 mit COL)
  await finishKO( 81, "USA", "CIV",  2, 1);          // 1.D vs Best3 → USA
  await finishKO( 82, "BEL", "AUS",  3, 0);          // 1.G vs Best3 → BEL (→ R16-94 mit USA)
  await finishKO( 76, "BRA", "JPN",  2, 0);          // 1.C vs 2.F   → BRA
  await finishKO( 78, "ECU", "NOR",  0, 1);          // 2.E vs 2.I   → NOR (→ R16-91 mit BRA)
  await finishKO( 79, "MEX", "SWE",  2, 1);          // 1.A vs Best3 → MEX
  await finishKO( 80, "ENG", "KSA",  3, 0);          // 1.L vs Best3 → ENG (→ R16-92 mit MEX)
  await finishKO( 86, "ARG", "URU",  2, 0);          // 1.J vs 2.H   → ARG ← Finalkandidat
  await finishKO( 88, "TUR", "EGY",  1, 0);          // 2.D vs 2.G   → TUR (→ R16-95 mit ARG)
  await finishKO( 85, "CAN", "SEN",  1, 0);          // 1.B vs Best3 → CAN
  await finishKO( 87, "POR", "SCO",  2, 1);          // 1.K vs Best3 → POR (→ R16-96 mit CAN)
  console.log("✓ 16 Spiele gesetzt");

  // ════════════════════════════════════════════════════════════
  // 3) ACHTELFINALE
  // ════════════════════════════════════════════════════════════
  console.log("🏆 Achtelfinale...");
  await finishKO( 89, "GER", "FRA",  2, 1);          // GER ✓ (Klassiker!)
  await finishKO( 90, "NED", "KOR",  2, 0);          // NED → QF-97 Gegner GER
  await finishKO( 93, "ESP", "COL",  2, 1);          // ESP
  await finishKO( 94, "BEL", "USA",  1, 0);          // BEL → QF-98 mit ESP
  await finishKO( 91, "BRA", "NOR",  2, 1);          // BRA
  await finishKO( 92, "ENG", "MEX",  2, 0);          // ENG → QF-99 mit BRA
  await finishKO( 95, "ARG", "TUR",  3, 0);          // ARG ← Finalkandidat
  await finishKO( 96, "POR", "CAN",  2, 1);          // POR → QF-100 mit ARG
  console.log("✓ 8 Spiele gesetzt");

  // ════════════════════════════════════════════════════════════
  // 4) VIERTELFINALE
  // ════════════════════════════════════════════════════════════
  console.log("🏆 Viertelfinale...");
  await finishKO( 97, "GER", "NED",  1, 0);          // GER ✓
  await finishKO( 98, "ESP", "BEL",  2, 0);          // ESP → HF-101 Gegner GER
  await finishKO( 99, "BRA", "ENG",  2, 1);          // BRA
  await finishKO(100, "ARG", "POR",  2, 1);          // ARG → HF-102 mit BRA
  console.log("✓ 4 Spiele gesetzt");

  // ════════════════════════════════════════════════════════════
  // 5) HALBFINALE
  // ════════════════════════════════════════════════════════════
  console.log("🏆 Halbfinale...");
  await finishKO(101, "GER", "ESP",  2, 1);          // GER ins Finale! ✓
  await finishKO(102, "ARG", "BRA",  2, 1);          // ARG ins Finale
  console.log("✓ GER 🆚 ARG im Finale");

  // ════════════════════════════════════════════════════════════
  // 6) SPIEL UM PLATZ 3 & FINALE
  // ════════════════════════════════════════════════════════════
  console.log("🏆 Finale & Platz 3...");
  await finishKO(103, "BRA", "ESP",  2, 1);          // Platz 3: BRA
  await finishKO(104, "GER", "ARG",  2, 1);          // 🏆 DEUTSCHLAND WELTMEISTER!
  console.log("✓ 🇩🇪 Deutschland ist Weltmeister!");

  console.log("\n✅ Alle Test-Ergebnisse eingetragen!");
  console.log("   → /bracket aufrufen zum Testen");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await pool.end(); });
