# wmflow — Setup Guide

## Voraussetzungen

- Node.js 20+
- pnpm
- PostgreSQL-Datenbank (z.B. [Neon](https://neon.tech))
- Discord Application für OAuth

## 1. Repository klonen

```bash
git clone https://github.com/30jannik06/wmflow.git
cd wmflow
pnpm install
```

## 2. Environment konfigurieren

```bash
cp .env.example .env
```

`.env` befüllen:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=verify-full"
AUTH_SECRET="..."         # openssl rand -base64 32
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
ADMIN_REGISTRATION_OPEN="false"
```

**Discord App einrichten:** https://discord.com/developers/applications  
Redirect URI: `http://localhost:3000/api/auth/callback/discord`

## 3. Datenbank migrieren & seeden

```bash
npx prisma migrate dev
npx prisma db seed        # 48 Teams + 72 Gruppenspiele + 32 KO-Spiele
```

## 4. Dev-Server starten

```bash
pnpm dev
```

→ http://localhost:3000

## 5. Admin-Account registrieren

```env
# .env:
ADMIN_REGISTRATION_OPEN="true"
```

→ `/admin/login` → Discord-Login → zurück auf `false` setzen.

## Nützliche Befehle

```bash
pnpm dev                            # Dev-Server
npx prisma db seed                  # Seed zurücksetzen
npx tsx prisma/seed-test-results.ts # Test: Deutschland gewinnt WM
npx next build                      # Build-Check
npx prisma studio                   # DB-GUI
```

## Prisma 7 — Breaking Changes

Diese Version weicht von älteren Prisma-Tutorials ab:

- `url` steht **nicht** in `datasource db {}` — kommt aus `prisma.config.ts` via `defineConfig`
- Generator-Output explizit: `output = "../src/generated/prisma"`
- Import immer: `import { PrismaClient } from "@/generated/prisma"` — nie `@prisma/client`
- Seed-Config in `prisma.config.ts` unter `migrations.seed`, nicht nur in `package.json`

## Design-System

**Farbpalette:**
- `--ink: #0a1628` — Tiefes Marineblau
- `--paper: #f4ede0` — Warmes Cremeweiß
- `--accent: #d4ff3d` — Säure-Gelb
- `--accent-2: #ff4d2e` — Coral

**Typografie:**
- Display: Fraunces (variable Serif)
- Body: Inter Tight
- Mono: JetBrains Mono

**Tailwind v4:** CSS-first — `@import "tailwindcss"` + `@theme inline` in `globals.css`, kein `tailwind.config.js`.
