import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// WM 2026 — 48 Teams, Gruppen A–L
// Auslosung: 05.12.2025, Kennedy Center, Washington D.C.
// ============================================================
const TEAMS: {
  fifaCode: string;
  nameDe: string;
  nameEn: string;
  flagUrl: string;
  groupCode: string;
}[] = [
  // GRUPPE A
  { fifaCode: "MEX", nameDe: "Mexiko",            nameEn: "Mexico",            flagUrl: "mx",     groupCode: "A" },
  { fifaCode: "KOR", nameDe: "Südkorea",           nameEn: "South Korea",       flagUrl: "kr",     groupCode: "A" },
  { fifaCode: "RSA", nameDe: "Südafrika",           nameEn: "South Africa",      flagUrl: "za",     groupCode: "A" },
  { fifaCode: "CZE", nameDe: "Tschechien",          nameEn: "Czechia",           flagUrl: "cz",     groupCode: "A" },

  // GRUPPE B
  { fifaCode: "CAN", nameDe: "Kanada",              nameEn: "Canada",            flagUrl: "ca",     groupCode: "B" },
  { fifaCode: "SUI", nameDe: "Schweiz",             nameEn: "Switzerland",       flagUrl: "ch",     groupCode: "B" },
  { fifaCode: "QAT", nameDe: "Katar",               nameEn: "Qatar",             flagUrl: "qa",     groupCode: "B" },
  { fifaCode: "BIH", nameDe: "Bosnien-Herzegowina", nameEn: "Bosnia-Herzegovina",flagUrl: "ba",     groupCode: "B" },

  // GRUPPE C
  { fifaCode: "BRA", nameDe: "Brasilien",           nameEn: "Brazil",            flagUrl: "br",     groupCode: "C" },
  { fifaCode: "MAR", nameDe: "Marokko",             nameEn: "Morocco",           flagUrl: "ma",     groupCode: "C" },
  { fifaCode: "SCO", nameDe: "Schottland",          nameEn: "Scotland",          flagUrl: "gb-sct", groupCode: "C" },
  { fifaCode: "HAI", nameDe: "Haiti",               nameEn: "Haiti",             flagUrl: "ht",     groupCode: "C" },

  // GRUPPE D
  { fifaCode: "USA", nameDe: "USA",                 nameEn: "USA",               flagUrl: "us",     groupCode: "D" },
  { fifaCode: "PAR", nameDe: "Paraguay",            nameEn: "Paraguay",          flagUrl: "py",     groupCode: "D" },
  { fifaCode: "AUS", nameDe: "Australien",          nameEn: "Australia",         flagUrl: "au",     groupCode: "D" },
  { fifaCode: "TUR", nameDe: "Türkei",              nameEn: "Turkey",            flagUrl: "tr",     groupCode: "D" },

  // GRUPPE E
  { fifaCode: "GER", nameDe: "Deutschland",         nameEn: "Germany",           flagUrl: "de",     groupCode: "E" },
  { fifaCode: "ECU", nameDe: "Ecuador",             nameEn: "Ecuador",           flagUrl: "ec",     groupCode: "E" },
  { fifaCode: "CIV", nameDe: "Elfenbeinküste",      nameEn: "Ivory Coast",       flagUrl: "ci",     groupCode: "E" },
  { fifaCode: "CUW", nameDe: "Curaçao",             nameEn: "Curaçao",           flagUrl: "cw",     groupCode: "E" },

  // GRUPPE F
  { fifaCode: "NED", nameDe: "Niederlande",         nameEn: "Netherlands",       flagUrl: "nl",     groupCode: "F" },
  { fifaCode: "JPN", nameDe: "Japan",               nameEn: "Japan",             flagUrl: "jp",     groupCode: "F" },
  { fifaCode: "TUN", nameDe: "Tunesien",            nameEn: "Tunisia",           flagUrl: "tn",     groupCode: "F" },
  { fifaCode: "SWE", nameDe: "Schweden",            nameEn: "Sweden",            flagUrl: "se",     groupCode: "F" },

  // GRUPPE G
  { fifaCode: "BEL", nameDe: "Belgien",             nameEn: "Belgium",           flagUrl: "be",     groupCode: "G" },
  { fifaCode: "IRN", nameDe: "Iran",                nameEn: "Iran",              flagUrl: "ir",     groupCode: "G" },
  { fifaCode: "EGY", nameDe: "Ägypten",             nameEn: "Egypt",             flagUrl: "eg",     groupCode: "G" },
  { fifaCode: "NZL", nameDe: "Neuseeland",          nameEn: "New Zealand",       flagUrl: "nz",     groupCode: "G" },

  // GRUPPE H
  { fifaCode: "ESP", nameDe: "Spanien",             nameEn: "Spain",             flagUrl: "es",     groupCode: "H" },
  { fifaCode: "URU", nameDe: "Uruguay",             nameEn: "Uruguay",           flagUrl: "uy",     groupCode: "H" },
  { fifaCode: "KSA", nameDe: "Saudi-Arabien",       nameEn: "Saudi Arabia",      flagUrl: "sa",     groupCode: "H" },
  { fifaCode: "CPV", nameDe: "Kap Verde",           nameEn: "Cape Verde",        flagUrl: "cv",     groupCode: "H" },

  // GRUPPE I
  { fifaCode: "FRA", nameDe: "Frankreich",          nameEn: "France",            flagUrl: "fr",     groupCode: "I" },
  { fifaCode: "SEN", nameDe: "Senegal",             nameEn: "Senegal",           flagUrl: "sn",     groupCode: "I" },
  { fifaCode: "NOR", nameDe: "Norwegen",            nameEn: "Norway",            flagUrl: "no",     groupCode: "I" },
  { fifaCode: "IRQ", nameDe: "Irak",                nameEn: "Iraq",              flagUrl: "iq",     groupCode: "I" },

  // GRUPPE J
  { fifaCode: "ARG", nameDe: "Argentinien",         nameEn: "Argentina",         flagUrl: "ar",     groupCode: "J" },
  { fifaCode: "AUT", nameDe: "Österreich",          nameEn: "Austria",           flagUrl: "at",     groupCode: "J" },
  { fifaCode: "ALG", nameDe: "Algerien",            nameEn: "Algeria",           flagUrl: "dz",     groupCode: "J" },
  { fifaCode: "JOR", nameDe: "Jordanien",           nameEn: "Jordan",            flagUrl: "jo",     groupCode: "J" },

  // GRUPPE K
  { fifaCode: "POR", nameDe: "Portugal",            nameEn: "Portugal",          flagUrl: "pt",     groupCode: "K" },
  { fifaCode: "COL", nameDe: "Kolumbien",           nameEn: "Colombia",          flagUrl: "co",     groupCode: "K" },
  { fifaCode: "UZB", nameDe: "Usbekistan",          nameEn: "Uzbekistan",        flagUrl: "uz",     groupCode: "K" },
  { fifaCode: "COD", nameDe: "DR Kongo",            nameEn: "DR Congo",          flagUrl: "cd",     groupCode: "K" },

  // GRUPPE L
  { fifaCode: "ENG", nameDe: "England",             nameEn: "England",           flagUrl: "gb-eng", groupCode: "L" },
  { fifaCode: "CRO", nameDe: "Kroatien",            nameEn: "Croatia",           flagUrl: "hr",     groupCode: "L" },
  { fifaCode: "PAN", nameDe: "Panama",              nameEn: "Panama",            flagUrl: "pa",     groupCode: "L" },
  { fifaCode: "GHA", nameDe: "Ghana",               nameEn: "Ghana",             flagUrl: "gh",     groupCode: "L" },
];

// ============================================================
// GRUPPENSPIELE — alle 72 Partien, Zeiten in UTC (EDT = UTC-4)
// Quelle: offizielle FIFA-Spielplan, Stand April 2026
// ============================================================
const MATCHES: {
  matchNumber: number;
  homeCode: string;
  awayCode: string;
  kickoffUtc: Date;
  venue: string;
  city: string;
}[] = [
  // ── Do 11. Juni ──────────────────────────────────────────
  { matchNumber:  1, homeCode: "MEX", awayCode: "RSA", kickoffUtc: new Date("2026-06-11T19:00:00Z"), venue: "Estadio Azteca",         city: "Mexico City"     },
  { matchNumber:  2, homeCode: "KOR", awayCode: "CZE", kickoffUtc: new Date("2026-06-12T02:00:00Z"), venue: "Estadio Akron",          city: "Zapopan"         },
  // ── Fr 12. Juni ──────────────────────────────────────────
  { matchNumber:  3, homeCode: "CAN", awayCode: "BIH", kickoffUtc: new Date("2026-06-12T19:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber:  4, homeCode: "USA", awayCode: "PAR", kickoffUtc: new Date("2026-06-13T01:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  // ── Sa 13. Juni ──────────────────────────────────────────
  { matchNumber:  5, homeCode: "QAT", awayCode: "SUI", kickoffUtc: new Date("2026-06-13T19:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  { matchNumber:  6, homeCode: "BRA", awayCode: "MAR", kickoffUtc: new Date("2026-06-13T22:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber:  7, homeCode: "HAI", awayCode: "SCO", kickoffUtc: new Date("2026-06-14T01:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  // ── So 14. Juni ──────────────────────────────────────────
  { matchNumber:  8, homeCode: "AUS", awayCode: "TUR", kickoffUtc: new Date("2026-06-14T04:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  { matchNumber:  9, homeCode: "GER", awayCode: "CUW", kickoffUtc: new Date("2026-06-14T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber: 10, homeCode: "NED", awayCode: "JPN", kickoffUtc: new Date("2026-06-14T20:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber: 11, homeCode: "CIV", awayCode: "ECU", kickoffUtc: new Date("2026-06-14T23:00:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber: 12, homeCode: "SWE", awayCode: "TUN", kickoffUtc: new Date("2026-06-15T02:00:00Z"), venue: "Estadio BBVA",           city: "Monterrey"       },
  // ── Mo 15. Juni ──────────────────────────────────────────
  { matchNumber: 13, homeCode: "ESP", awayCode: "CPV", kickoffUtc: new Date("2026-06-15T16:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber: 14, homeCode: "BEL", awayCode: "EGY", kickoffUtc: new Date("2026-06-15T19:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber: 15, homeCode: "KSA", awayCode: "URU", kickoffUtc: new Date("2026-06-15T22:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber: 16, homeCode: "IRN", awayCode: "NZL", kickoffUtc: new Date("2026-06-16T01:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  // ── Di 16. Juni ──────────────────────────────────────────
  { matchNumber: 17, homeCode: "FRA", awayCode: "SEN", kickoffUtc: new Date("2026-06-16T19:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber: 18, homeCode: "IRQ", awayCode: "NOR", kickoffUtc: new Date("2026-06-16T22:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber: 19, homeCode: "ARG", awayCode: "ALG", kickoffUtc: new Date("2026-06-17T01:00:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  // ── Mi 17. Juni ──────────────────────────────────────────
  { matchNumber: 20, homeCode: "AUT", awayCode: "JOR", kickoffUtc: new Date("2026-06-17T04:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  { matchNumber: 21, homeCode: "POR", awayCode: "COD", kickoffUtc: new Date("2026-06-17T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber: 22, homeCode: "ENG", awayCode: "CRO", kickoffUtc: new Date("2026-06-17T20:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber: 23, homeCode: "GHA", awayCode: "PAN", kickoffUtc: new Date("2026-06-17T23:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber: 24, homeCode: "UZB", awayCode: "COL", kickoffUtc: new Date("2026-06-18T02:00:00Z"), venue: "Estadio Azteca",         city: "Mexico City"     },
  // ── Do 18. Juni ──────────────────────────────────────────
  { matchNumber: 25, homeCode: "CZE", awayCode: "RSA", kickoffUtc: new Date("2026-06-18T16:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber: 26, homeCode: "SUI", awayCode: "BIH", kickoffUtc: new Date("2026-06-18T19:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber: 27, homeCode: "CAN", awayCode: "QAT", kickoffUtc: new Date("2026-06-18T22:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  { matchNumber: 28, homeCode: "MEX", awayCode: "KOR", kickoffUtc: new Date("2026-06-19T01:00:00Z"), venue: "Estadio Akron",          city: "Zapopan"         },
  // ── Fr 19. Juni ──────────────────────────────────────────
  { matchNumber: 29, homeCode: "USA", awayCode: "AUS", kickoffUtc: new Date("2026-06-19T19:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber: 30, homeCode: "SCO", awayCode: "MAR", kickoffUtc: new Date("2026-06-19T22:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber: 31, homeCode: "BRA", awayCode: "HAI", kickoffUtc: new Date("2026-06-20T00:30:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber: 32, homeCode: "TUR", awayCode: "PAR", kickoffUtc: new Date("2026-06-20T03:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  // ── Sa 20. Juni ──────────────────────────────────────────
  { matchNumber: 33, homeCode: "NED", awayCode: "SWE", kickoffUtc: new Date("2026-06-20T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber: 34, homeCode: "GER", awayCode: "CIV", kickoffUtc: new Date("2026-06-20T20:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber: 35, homeCode: "ECU", awayCode: "CUW", kickoffUtc: new Date("2026-06-21T00:00:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  // ── So 21. Juni ──────────────────────────────────────────
  { matchNumber: 36, homeCode: "TUN", awayCode: "JPN", kickoffUtc: new Date("2026-06-21T04:00:00Z"), venue: "Estadio BBVA",           city: "Monterrey"       },
  { matchNumber: 37, homeCode: "ESP", awayCode: "KSA", kickoffUtc: new Date("2026-06-21T16:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber: 38, homeCode: "BEL", awayCode: "IRN", kickoffUtc: new Date("2026-06-21T19:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber: 39, homeCode: "URU", awayCode: "CPV", kickoffUtc: new Date("2026-06-21T22:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber: 40, homeCode: "NZL", awayCode: "EGY", kickoffUtc: new Date("2026-06-22T01:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  // ── Mo 22. Juni ──────────────────────────────────────────
  { matchNumber: 41, homeCode: "ARG", awayCode: "AUT", kickoffUtc: new Date("2026-06-22T17:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber: 42, homeCode: "FRA", awayCode: "IRQ", kickoffUtc: new Date("2026-06-22T21:00:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber: 43, homeCode: "NOR", awayCode: "SEN", kickoffUtc: new Date("2026-06-23T00:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber: 44, homeCode: "JOR", awayCode: "ALG", kickoffUtc: new Date("2026-06-23T03:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  // ── Di 23. Juni ──────────────────────────────────────────
  { matchNumber: 45, homeCode: "POR", awayCode: "UZB", kickoffUtc: new Date("2026-06-23T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber: 46, homeCode: "ENG", awayCode: "GHA", kickoffUtc: new Date("2026-06-23T20:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber: 47, homeCode: "PAN", awayCode: "CRO", kickoffUtc: new Date("2026-06-23T23:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber: 48, homeCode: "COL", awayCode: "COD", kickoffUtc: new Date("2026-06-24T02:00:00Z"), venue: "Estadio Akron",          city: "Zapopan"         },
  // ── Mi 24. Juni (Spieltag 3 — simultane Anstoßzeiten) ────
  { matchNumber: 49, homeCode: "SUI", awayCode: "CAN", kickoffUtc: new Date("2026-06-24T19:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  { matchNumber: 50, homeCode: "BIH", awayCode: "QAT", kickoffUtc: new Date("2026-06-24T19:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber: 51, homeCode: "SCO", awayCode: "BRA", kickoffUtc: new Date("2026-06-24T22:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber: 52, homeCode: "MAR", awayCode: "HAI", kickoffUtc: new Date("2026-06-24T22:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber: 53, homeCode: "CZE", awayCode: "MEX", kickoffUtc: new Date("2026-06-25T01:00:00Z"), venue: "Estadio Azteca",         city: "Mexico City"     },
  { matchNumber: 54, homeCode: "RSA", awayCode: "KOR", kickoffUtc: new Date("2026-06-25T01:00:00Z"), venue: "Estadio BBVA",           city: "Monterrey"       },
  // ── Do 25. Juni (Spieltag 3 — simultane Anstoßzeiten) ────
  { matchNumber: 55, homeCode: "CUW", awayCode: "CIV", kickoffUtc: new Date("2026-06-25T20:00:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber: 56, homeCode: "ECU", awayCode: "GER", kickoffUtc: new Date("2026-06-25T20:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber: 57, homeCode: "JPN", awayCode: "SWE", kickoffUtc: new Date("2026-06-25T23:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber: 58, homeCode: "TUN", awayCode: "NED", kickoffUtc: new Date("2026-06-25T23:00:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  { matchNumber: 59, homeCode: "TUR", awayCode: "USA", kickoffUtc: new Date("2026-06-26T02:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber: 60, homeCode: "PAR", awayCode: "AUS", kickoffUtc: new Date("2026-06-26T02:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  // ── Fr 26. Juni (Spieltag 3 — simultane Anstoßzeiten) ────
  { matchNumber: 61, homeCode: "NOR", awayCode: "FRA", kickoffUtc: new Date("2026-06-26T19:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber: 62, homeCode: "SEN", awayCode: "IRQ", kickoffUtc: new Date("2026-06-26T19:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber: 63, homeCode: "CPV", awayCode: "KSA", kickoffUtc: new Date("2026-06-27T00:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber: 64, homeCode: "URU", awayCode: "ESP", kickoffUtc: new Date("2026-06-27T00:00:00Z"), venue: "Estadio Akron",          city: "Zapopan"         },
  { matchNumber: 65, homeCode: "EGY", awayCode: "IRN", kickoffUtc: new Date("2026-06-27T03:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber: 66, homeCode: "NZL", awayCode: "BEL", kickoffUtc: new Date("2026-06-27T03:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  // ── Sa 27. Juni (Spieltag 3 — simultane Anstoßzeiten) ────
  { matchNumber: 67, homeCode: "PAN", awayCode: "ENG", kickoffUtc: new Date("2026-06-27T21:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber: 68, homeCode: "CRO", awayCode: "GHA", kickoffUtc: new Date("2026-06-27T21:00:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber: 69, homeCode: "COL", awayCode: "POR", kickoffUtc: new Date("2026-06-27T23:30:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber: 70, homeCode: "COD", awayCode: "UZB", kickoffUtc: new Date("2026-06-27T23:30:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber: 71, homeCode: "ALG", awayCode: "AUT", kickoffUtc: new Date("2026-06-28T02:00:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  { matchNumber: 72, homeCode: "JOR", awayCode: "ARG", kickoffUtc: new Date("2026-06-28T02:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
];

// ============================================================
// KO-RUNDEN — Spiele 73–104, Platzhalter bis Teams bekannt
// Zeiten UTC (EDT = UTC-4)
// ============================================================
const KO_MATCHES: {
  matchNumber: number;
  phase: "r32" | "r16" | "qf" | "sf" | "third" | "final";
  homePlaceholder: string;
  awayPlaceholder: string;
  kickoffUtc: Date;
  venue: string;
  city: string;
}[] = [
  // ── Runde der 32 (28. Jun – 3. Jul) ─────────────────────
  { matchNumber:  73, phase: "r32",   homePlaceholder: "2. Gruppe A",            awayPlaceholder: "2. Gruppe B",              kickoffUtc: new Date("2026-06-28T19:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber:  74, phase: "r32",   homePlaceholder: "1. Gruppe E",            awayPlaceholder: "Bester 3. (A/B/C/D/F)",   kickoffUtc: new Date("2026-06-29T20:30:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber:  75, phase: "r32",   homePlaceholder: "1. Gruppe F",            awayPlaceholder: "2. Gruppe C",              kickoffUtc: new Date("2026-06-30T01:00:00Z"), venue: "Estadio BBVA",           city: "Monterrey"       },
  { matchNumber:  76, phase: "r32",   homePlaceholder: "1. Gruppe C",            awayPlaceholder: "2. Gruppe F",              kickoffUtc: new Date("2026-06-29T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber:  77, phase: "r32",   homePlaceholder: "1. Gruppe I",            awayPlaceholder: "Bester 3. (C/D/F/G/H)",   kickoffUtc: new Date("2026-06-30T21:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber:  78, phase: "r32",   homePlaceholder: "2. Gruppe E",            awayPlaceholder: "2. Gruppe I",              kickoffUtc: new Date("2026-06-30T17:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber:  79, phase: "r32",   homePlaceholder: "1. Gruppe A",            awayPlaceholder: "Bester 3. (C/E/F/H/I)",   kickoffUtc: new Date("2026-07-01T01:00:00Z"), venue: "Estadio Azteca",         city: "Mexico City"     },
  { matchNumber:  80, phase: "r32",   homePlaceholder: "1. Gruppe L",            awayPlaceholder: "Bester 3. (E/H/I/J/K)",   kickoffUtc: new Date("2026-07-01T16:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber:  81, phase: "r32",   homePlaceholder: "1. Gruppe D",            awayPlaceholder: "Bester 3. (B/E/F/I/J)",   kickoffUtc: new Date("2026-07-02T00:00:00Z"), venue: "Levi's Stadium",         city: "Santa Clara"     },
  { matchNumber:  82, phase: "r32",   homePlaceholder: "1. Gruppe G",            awayPlaceholder: "Bester 3. (A/E/H/I/J)",   kickoffUtc: new Date("2026-07-01T20:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber:  83, phase: "r32",   homePlaceholder: "2. Gruppe K",            awayPlaceholder: "2. Gruppe L",              kickoffUtc: new Date("2026-07-02T23:00:00Z"), venue: "BMO Field",              city: "Toronto"         },
  { matchNumber:  84, phase: "r32",   homePlaceholder: "1. Gruppe H",            awayPlaceholder: "2. Gruppe J",              kickoffUtc: new Date("2026-07-02T19:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber:  85, phase: "r32",   homePlaceholder: "1. Gruppe B",            awayPlaceholder: "Bester 3. (E/F/G/I/J)",   kickoffUtc: new Date("2026-07-03T03:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  { matchNumber:  86, phase: "r32",   homePlaceholder: "1. Gruppe J",            awayPlaceholder: "2. Gruppe H",              kickoffUtc: new Date("2026-07-03T22:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber:  87, phase: "r32",   homePlaceholder: "1. Gruppe K",            awayPlaceholder: "Bester 3. (D/E/I/J/L)",   kickoffUtc: new Date("2026-07-04T01:30:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  { matchNumber:  88, phase: "r32",   homePlaceholder: "2. Gruppe D",            awayPlaceholder: "2. Gruppe G",              kickoffUtc: new Date("2026-07-03T18:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  // ── Achtelfinale (4.–7. Jul) ──────────────────────────────
  { matchNumber:  89, phase: "r16",   homePlaceholder: "Sieger Spiel 74",        awayPlaceholder: "Sieger Spiel 77",          kickoffUtc: new Date("2026-07-04T21:00:00Z"), venue: "Lincoln Financial Field",city: "Philadelphia"    },
  { matchNumber:  90, phase: "r16",   homePlaceholder: "Sieger Spiel 73",        awayPlaceholder: "Sieger Spiel 75",          kickoffUtc: new Date("2026-07-04T17:00:00Z"), venue: "NRG Stadium",            city: "Houston"         },
  { matchNumber:  91, phase: "r16",   homePlaceholder: "Sieger Spiel 76",        awayPlaceholder: "Sieger Spiel 78",          kickoffUtc: new Date("2026-07-05T20:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
  { matchNumber:  92, phase: "r16",   homePlaceholder: "Sieger Spiel 79",        awayPlaceholder: "Sieger Spiel 80",          kickoffUtc: new Date("2026-07-06T00:00:00Z"), venue: "Estadio Azteca",         city: "Mexico City"     },
  { matchNumber:  93, phase: "r16",   homePlaceholder: "Sieger Spiel 83",        awayPlaceholder: "Sieger Spiel 84",          kickoffUtc: new Date("2026-07-06T19:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber:  94, phase: "r16",   homePlaceholder: "Sieger Spiel 81",        awayPlaceholder: "Sieger Spiel 82",          kickoffUtc: new Date("2026-07-07T00:00:00Z"), venue: "Lumen Field",            city: "Seattle"         },
  { matchNumber:  95, phase: "r16",   homePlaceholder: "Sieger Spiel 86",        awayPlaceholder: "Sieger Spiel 88",          kickoffUtc: new Date("2026-07-07T16:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  { matchNumber:  96, phase: "r16",   homePlaceholder: "Sieger Spiel 85",        awayPlaceholder: "Sieger Spiel 87",          kickoffUtc: new Date("2026-07-07T20:00:00Z"), venue: "BC Place",               city: "Vancouver"       },
  // ── Viertelfinale (9.–11. Jul) ────────────────────────────
  { matchNumber:  97, phase: "qf",    homePlaceholder: "Sieger Spiel 89",        awayPlaceholder: "Sieger Spiel 90",          kickoffUtc: new Date("2026-07-09T20:00:00Z"), venue: "Gillette Stadium",       city: "Foxborough"      },
  { matchNumber:  98, phase: "qf",    homePlaceholder: "Sieger Spiel 93",        awayPlaceholder: "Sieger Spiel 94",          kickoffUtc: new Date("2026-07-10T19:00:00Z"), venue: "SoFi Stadium",           city: "Inglewood"       },
  { matchNumber:  99, phase: "qf",    homePlaceholder: "Sieger Spiel 91",        awayPlaceholder: "Sieger Spiel 92",          kickoffUtc: new Date("2026-07-11T21:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  { matchNumber: 100, phase: "qf",    homePlaceholder: "Sieger Spiel 95",        awayPlaceholder: "Sieger Spiel 96",          kickoffUtc: new Date("2026-07-12T01:00:00Z"), venue: "Arrowhead Stadium",      city: "Kansas City"     },
  // ── Halbfinale (14.–15. Jul) ──────────────────────────────
  { matchNumber: 101, phase: "sf",    homePlaceholder: "Sieger Spiel 97",        awayPlaceholder: "Sieger Spiel 98",          kickoffUtc: new Date("2026-07-14T19:00:00Z"), venue: "AT&T Stadium",           city: "Arlington"       },
  { matchNumber: 102, phase: "sf",    homePlaceholder: "Sieger Spiel 99",        awayPlaceholder: "Sieger Spiel 100",         kickoffUtc: new Date("2026-07-15T19:00:00Z"), venue: "Mercedes-Benz Stadium",  city: "Atlanta"         },
  // ── Spiel um Platz 3 (18. Jul) ────────────────────────────
  { matchNumber: 103, phase: "third", homePlaceholder: "Verlierer Spiel 101",    awayPlaceholder: "Verlierer Spiel 102",      kickoffUtc: new Date("2026-07-18T21:00:00Z"), venue: "Hard Rock Stadium",      city: "Miami Gardens"   },
  // ── Finale (19. Jul) ──────────────────────────────────────
  { matchNumber: 104, phase: "final", homePlaceholder: "Sieger Spiel 101",       awayPlaceholder: "Sieger Spiel 102",         kickoffUtc: new Date("2026-07-19T19:00:00Z"), venue: "MetLife Stadium",        city: "East Rutherford" },
];

async function main() {
  console.log("🧹 Bereinige alte Daten...");
  await prisma.match.deleteMany();
  await prisma.groupStanding.deleteMany();
  await prisma.team.deleteMany();

  console.log("🌍 Seede WM 2026 Teams...");
  for (const team of TEAMS) {
    await prisma.team.create({ data: team });
  }
  console.log(`✓ ${TEAMS.length} Teams angelegt`);

  console.log("📊 Erstelle initiale Gruppen-Tabellen...");
  for (const team of TEAMS) {
    const dbTeam = await prisma.team.findUnique({ where: { fifaCode: team.fifaCode } });
    if (!dbTeam) continue;

    const positionInGroup =
      TEAMS.filter((t) => t.groupCode === team.groupCode).indexOf(team) + 1;

    await prisma.groupStanding.create({
      data: {
        groupCode: team.groupCode,
        teamId: dbTeam.id,
        position: positionInGroup,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0,
      },
    });
  }
  console.log("✓ Gruppen-Tabellen initialisiert");

  console.log("⚽ Seede 72 Gruppenspiele...");
  const teamMap = new Map<string, string>();
  const allTeams = await prisma.team.findMany();
  for (const t of allTeams) teamMap.set(t.fifaCode, t.id);

  for (const match of MATCHES) {
    const homeId = teamMap.get(match.homeCode);
    const awayId = teamMap.get(match.awayCode);
    if (!homeId || !awayId) {
      console.error(`⚠ Team nicht gefunden: ${match.homeCode} | ${match.awayCode}`);
      continue;
    }
    await prisma.match.create({
      data: {
        matchNumber: match.matchNumber,
        phase: "group",
        status: "scheduled",
        kickoffUtc: match.kickoffUtc,
        venue: match.venue,
        city: match.city,
        homeTeamId: homeId,
        awayTeamId: awayId,
      },
    });
  }
  console.log(`✓ ${MATCHES.length} Gruppenspiele angelegt`);

  console.log("🏆 Seede KO-Runden (73–104)...");
  for (const match of KO_MATCHES) {
    await prisma.match.create({
      data: {
        matchNumber:     match.matchNumber,
        phase:           match.phase,
        status:          "scheduled",
        kickoffUtc:      match.kickoffUtc,
        venue:           match.venue,
        city:            match.city,
        homePlaceholder: match.homePlaceholder,
        awayPlaceholder: match.awayPlaceholder,
      },
    });
  }
  console.log(`✓ ${KO_MATCHES.length} KO-Spiele angelegt`);

  // ============================================================
  // nextMatchId WIRING — Bracket Auto-Advancement
  // Abgeleitet aus den Platzhaltern der KO_MATCHES oben.
  // ============================================================
  console.log("🔗 Verknüpfe Bracket (nextMatchId)...");

  const allMatches = await prisma.match.findMany({ select: { id: true, matchNumber: true } });
  const matchByNum = new Map(allMatches.map((m) => [m.matchNumber, m.id]));

  // Nur Winner-Pfade; Verlierer SF → Platz 3 hat kein nextMatchId im Schema
  const NEXT: { from: number; to: number; slot: "home" | "away" }[] = [
    // R32 → R16
    { from:  73, to:  90, slot: "home" },
    { from:  74, to:  89, slot: "home" },
    { from:  75, to:  90, slot: "away" },
    { from:  76, to:  91, slot: "home" },
    { from:  77, to:  89, slot: "away" },
    { from:  78, to:  91, slot: "away" },
    { from:  79, to:  92, slot: "home" },
    { from:  80, to:  92, slot: "away" },
    { from:  81, to:  94, slot: "home" },
    { from:  82, to:  94, slot: "away" },
    { from:  83, to:  93, slot: "home" },
    { from:  84, to:  93, slot: "away" },
    { from:  85, to:  96, slot: "home" },
    { from:  86, to:  95, slot: "home" },
    { from:  87, to:  96, slot: "away" },
    { from:  88, to:  95, slot: "away" },
    // R16 → QF
    { from:  89, to:  97, slot: "home" },
    { from:  90, to:  97, slot: "away" },
    { from:  91, to:  99, slot: "home" },
    { from:  92, to:  99, slot: "away" },
    { from:  93, to:  98, slot: "home" },
    { from:  94, to:  98, slot: "away" },
    { from:  95, to: 100, slot: "home" },
    { from:  96, to: 100, slot: "away" },
    // QF → SF
    { from:  97, to: 101, slot: "home" },
    { from:  98, to: 101, slot: "away" },
    { from:  99, to: 102, slot: "home" },
    { from: 100, to: 102, slot: "away" },
    // SF → Finale
    { from: 101, to: 104, slot: "home" },
    { from: 102, to: 104, slot: "away" },
  ];

  for (const { from, to, slot } of NEXT) {
    const fromId = matchByNum.get(from);
    const toId   = matchByNum.get(to);
    if (!fromId || !toId) {
      console.error(`⚠ Spiel nicht gefunden: ${from} → ${to}`);
      continue;
    }
    await prisma.match.update({
      where: { id: fromId },
      data:  { nextMatchId: toId, nextSlot: slot },
    });
  }
  console.log(`✓ ${NEXT.length} Bracket-Verbindungen gesetzt`);
  console.log("✅ Seed abgeschlossen!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
