# wmflow — Setup Guide

## 1. Projekt initialisieren

```bash
npx create-next-app@latest wmflow --typescript --tailwind --app --src-dir=false
cd wmflow
```

## 2. Dependencies installieren

```bash
# Animation & Smooth Scroll
npm install framer-motion lenis

# Database
npm install prisma @prisma/client
npm install -D prisma

# i18n (für DE + EN)
npm install next-intl

# Newsletter (Empfehlung Brevo)
npm install @getbrevo/brevo
```

## 3. Prisma einrichten

```bash
# Schema-Datei aus diesem Setup übernehmen → prisma/schema.prisma
# .env anlegen mit deiner DB-URL:
echo 'DATABASE_URL="postgresql://USER:PASS@HOST:5432/wmflow?sslmode=require"' > .env

# Migration laufen lassen
npx prisma migrate dev --name init
npx prisma generate
```

## 4. Lenis Provider in Layout einbinden

In `app/layout.tsx`:

```tsx
import LenisProvider from './_components/LenisProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
```

## 5. Dateien aus diesem Bundle kopieren

| Datei | Ziel |
|---|---|
| `prisma/schema.prisma` | `prisma/schema.prisma` |
| `app/_components/LenisProvider.tsx` | `app/_components/LenisProvider.tsx` |
| `app/page.tsx` | `app/page.tsx` |

## 6. Dev-Server starten

```bash
npm run dev
```

→ http://localhost:3000

## 7. Was als Nächstes

- [ ] DB-URL in `.env` eintragen, dann `npx prisma migrate dev`
- [ ] Newsletter-API-Route bauen: `app/api/newsletter/route.ts` (Brevo SDK)
- [ ] Hero-Background-Bild ersetzen (aktuell SVG-Stadion, später echtes Foto möglich)
- [ ] i18n-Routing auf `/de` und `/en` aufteilen mit `next-intl`
- [ ] Sport-Daten-API-Provider entscheiden und Repository-Layer bauen

## Design-Notes

**Aesthetic:** Editorial-Sport, inspiriert von The Athletic / Copa90 — bewusst NICHT klassisches FIFA-Blau-Weiß-Rot.

**Farb-Palette:**
- `--ink: #0a1628` (tiefes Marineblau, fast schwarz)
- `--paper: #f4ede0` (warmes Cremeweiß, vermeidet steriles Weiß)
- `--accent: #d4ff3d` (Säure-Gelb/Limette, energetisch)
- `--accent-2: #ff4d2e` (Coral als zweiter Akzent)

**Typografie:**
- Display: Fraunces (variable Serif mit Charakter)
- Body: Inter Tight
- Mono: JetBrains Mono (für Tags & Mikro-Labels)

**Parallax-Layer (Hero):**
1. Sky — Sterne + Lichtschein (slowest)
2. Stadium — SVG-Silhouette mit Flutlichtern
3. Floating Flags — 8 Team-Emojis mit eigenem Bewegungs-Profil
4. Foreground — Headline + Countdown (fastest)

Plus Noise-Overlay für Editorial-Print-Feel.