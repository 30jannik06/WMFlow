# wmflow

**FIFA WM 2026 Live-Tracker** — Gruppen, Spielplan, KO-Bracket.

Editorial-Sport-Aesthetic: Tiefblau `#0a1628` + Säuregelb `#d4ff3d`, inspiriert von The Athletic / Copa90.

## Features

- **Landing Page** — Countdown zur WM, Floating Flags mit Parallax
- **Gruppen** — 12 Gruppen-Tabellen mit Live-Standings
- **Spielplan** — 72 Gruppenspiele nach Datum gruppiert
- **KO-Bracket** — Visueller Bracket R32 → Finale mit SVG-Konnektoren
- **Admin Panel** — Ergebnisse eintragen, Discord OAuth (Whitelist-basiert)

## Tech Stack

| | |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 6 |
| Styling | Tailwind CSS v4 (CSS-first) |
| Animation | framer-motion 12, Lenis (smooth scroll) |
| DB | Prisma 7 + PrismaPg Adapter + PostgreSQL (Neon) |
| Auth | NextAuth v5, Discord OAuth |
| Flags | flag-icons (`fi fi-{iso2}`) |
| i18n | next-intl (vorbereitet) |
| Package Manager | pnpm |

## Setup

### 1. Dependencies

```bash
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
# .env befüllen: DATABASE_URL, AUTH_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
```

`AUTH_SECRET` generieren:
```bash
openssl rand -base64 32
```

### 3. Datenbank

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Dev-Server

```bash
pnpm dev
```

→ http://localhost:3000

## Admin einrichten

1. `.env`: `ADMIN_REGISTRATION_OPEN="true"`
2. `/admin/login` → Discord-Login → Account wird als Admin gespeichert
3. `.env`: `ADMIN_REGISTRATION_OPEN="false"`

## Prisma 7 — Breaking Changes

- `url` kommt **nicht** aus `datasource db {}` im Schema, sondern aus `prisma.config.ts` via `defineConfig`
- Prisma Client Output: `src/generated/prisma/` — Import: `import { PrismaClient } from "@/generated/prisma"`
- Seed-Config in `prisma.config.ts` unter `migrations.seed`

## Routen

| Route | Feature | Status |
|---|---|---|
| `/` | Landing Page, Countdown, Parallax | ✅ |
| `/gruppen` | 12 Gruppen-Tabellen | ✅ |
| `/spiele` | 72 Gruppenspiele nach Datum | ✅ |
| `/bracket` | KO-Bracket R32 → Finale | ✅ |
| `/admin` | Ergebnisse eintragen | ✅ |
| `/gruppen/[code]` | Gruppendetailseite | ⬜ |
