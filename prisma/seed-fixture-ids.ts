/**
 * Einmaliges Mapping: API-Football Fixture IDs → wmflow matchNumber
 *
 * Ausführen: npx tsx prisma/seed-fixture-ids.ts
 *
 * Was es macht:
 * 1. Holt alle WM 2026 Fixtures von API-Football (league=1, season=2026)
 * 2. Matched sie per Datum + FIFA-Code (home + away) gegen unsere DB-Matches
 * 3. Schreibt apiFixtureId in die Match-Tabelle
 *
 * Kosten: 1 API-Request (passt ins Free-Tier)
 */

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = "https://v3.football.api-sports.io";

// API-Football Country-Code → wmflow fifaCode
// Meistens identisch, aber ein paar Ausnahmen
const CODE_MAP: Record<string, string> = {
  "IR Iran":       "IRN",
  "Korea Republic":"KOR",
  "Korea DPR":     "PRK",
  "Ivory Coast":   "CIV",
  "Cape Verde":    "CPV",
  "Trinidad and Tobago": "TTO",
  "Bosnia":        "BIH",
  "Chinese Taipei":"TPE",
};

function normalizeCode(apiCode: string, apiName: string): string {
  return CODE_MAP[apiName] ?? apiCode?.toUpperCase() ?? "";
}

async function main() {
  if (!API_KEY) {
    console.error("❌  API_FOOTBALL_KEY fehlt in .env");
    process.exit(1);
  }

  console.log("📡  Fetching WM 2026 fixtures from API-Football...");
  const res = await fetch(`${API_BASE}/fixtures?league=1&season=2026`, {
    headers: { "x-apisports-key": API_KEY },
  });

  if (!res.ok) {
    console.error("❌  API Error:", res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const fixtures: ApiFixture[] = data.response ?? [];
  console.log(`✅  ${fixtures.length} Fixtures empfangen`);

  // Lade alle unsere Matches
  const dbMatches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
  });

  let mapped = 0;
  let skipped = 0;

  for (const fix of fixtures) {
    const fixtureDate = fix.fixture.date.slice(0, 10); // "2026-06-11"
    const homeCode = normalizeCode(fix.teams.home.code, fix.teams.home.name);
    const awayCode = normalizeCode(fix.teams.away.code, fix.teams.away.name);

    const match = dbMatches.find((m) => {
      const matchDate = m.kickoffUtc.toISOString().slice(0, 10);
      if (matchDate !== fixtureDate) return false;
      // Für Gruppenspiele: beide Teams bekannt → exakter Match
      if (m.homeTeam && m.awayTeam) {
        return m.homeTeam.fifaCode === homeCode && m.awayTeam.fifaCode === awayCode;
      }
      return false;
    });

    if (!match) {
      // KO-Spiele haben noch keine Teams → per Datum + Spielnummer-Reihenfolge matchen
      // wird automatisch befüllt sobald Teams feststehen
      skipped++;
      continue;
    }

    await prisma.match.update({
      where: { id: match.id },
      data: { apiFixtureId: fix.fixture.id },
    });

    console.log(`  ✓ #${match.matchNumber} ${homeCode} vs ${awayCode} → fixture ${fix.fixture.id}`);
    mapped++;
  }

  console.log(`\n🎯 ${mapped} Matches gemapped, ${skipped} übersprungen (KO ohne Teams)`);
  await pool.end();
}

type ApiFixture = {
  fixture: { id: number; date: string };
  league: { round: string };
  teams: {
    home: { id: number; name: string; code: string };
    away: { id: number; name: string; code: string };
  };
};

main().catch((e) => { console.error(e); process.exit(1); });
