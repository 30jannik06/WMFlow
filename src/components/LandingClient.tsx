"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, type MotionValue } from "framer-motion";

const WM_KICKOFF = new Date("2026-06-11T18:00:00Z");

const FLOATING_FLAGS = [
  { code: "GER", iso: "de", x: "8%",  y: "15%", delay: 0 },
  { code: "BRA", iso: "br", x: "85%", y: "22%", delay: 0.3 },
  { code: "ARG", iso: "ar", x: "15%", y: "70%", delay: 0.6 },
  { code: "FRA", iso: "fr", x: "78%", y: "65%", delay: 0.9 },
  { code: "ESP", iso: "es", x: "45%", y: "12%", delay: 1.2 },
  { code: "USA", iso: "us", x: "92%", y: "45%", delay: 1.5 },
  { code: "MEX", iso: "mx", x: "5%",  y: "45%", delay: 1.8 },
  { code: "JPN", iso: "jp", x: "55%", y: "85%", delay: 2.1 },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40, rotateX: -30 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      <div aria-hidden className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-2xl bg-[var(--accent)]/30 blur-sm" />
      <div aria-hidden className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-2xl bg-[var(--accent)]/60" />
      <div className="relative rounded-xl md:rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-3 md:px-8 md:py-7">
        <div className="font-display text-3xl md:text-7xl font-black tabular-nums leading-none text-[var(--ink)]">
          {String(value).padStart(2, "0")}
        </div>
        <div className="mt-1 md:mt-2 text-[9px] md:text-xs font-mono uppercase tracking-[0.15em] md:tracking-[0.2em] text-[var(--ink)]/60">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function FloatingFlag({
  iso, code, x, y, delay, scrollY,
}: {
  iso: string; code: string; x: string; y: string; delay: number; scrollY: MotionValue<number>;
}) {
  const yOffset = useTransform(scrollY, [0, 1], [0, -150 - delay * 40]);
  const opacity = useTransform(scrollY, [0, 0.6, 1], [1, 0.7, 0]);
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, y: yOffset, opacity }}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-2xl"
      >
        <span
          className={`fi fi-${iso} rounded-sm`}
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1 }}
        />
        <div className="text-[10px] font-mono text-center mt-1 text-[var(--paper)]/80 tracking-widest">
          {code}
        </div>
      </motion.div>
    </motion.div>
  );
}

export type UpcomingMatch = {
  id: string;
  matchNumber: number;
  kickoffUtc: string;
  venue: string;
  city: string;
  phase: string;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  homeTeam: { nameDe: string; nameEn: string; flagUrl: string } | null;
  awayTeam: { nameDe: string; nameEn: string; flagUrl: string } | null;
};

export default function LandingClient({ upcomingMatches }: { upcomingMatches: UpcomingMatch[] }) {
  const t = useTranslations("landing");
  const tp = useTranslations("phases");
  const locale = useLocale();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  const skyY = useTransform(smoothScroll, [0, 1], ["0%", "20%"]);
  const midY = useTransform(smoothScroll, [0, 1], ["0%", "50%"]);
  const fgY = useTransform(smoothScroll, [0, 1], ["0%", "110%"]);
  const heroFade = useTransform(smoothScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(smoothScroll, [0, 1], [1, 1.1]);

  const countdown = useCountdown(WM_KICKOFF);

  const fmtShort = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "de-DE", {
    timeZone: "Europe/Berlin",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  function teamName(team: { nameDe: string; nameEn: string }) {
    return locale === "en" ? team.nameEn : team.nameDe;
  }

  const timelineItems = [
    { phase: tp("group"),  dates: locale === "en" ? "Jun 11–27"     : "11.–27. Juni",     matches: 72, accent: false },
    { phase: tp("r32"),    dates: locale === "en" ? "Jun 28–Jul 4"  : "28. Juni–4. Juli", matches: 16, accent: false },
    { phase: tp("r16"),    dates: locale === "en" ? "Jul 5–8"       : "5.–8. Juli",       matches: 8,  accent: false },
    { phase: tp("qf"),     dates: locale === "en" ? "Jul 10–11"     : "10.–11. Juli",     matches: 4,  accent: false },
    { phase: tp("sf"),     dates: locale === "en" ? "Jul 14–15"     : "14.–15. Juli",     matches: 2,  accent: false },
    { phase: tp("final"),  dates: locale === "en" ? "Jul 19"        : "19. Juli",         matches: 1,  accent: true },
  ];

  return (
    <main className="relative bg-[var(--paper)] text-[var(--ink)]">
      <div className="noise" />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-[140vh] overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0a1628 0%, #1a2f4f 60%, #f4ede0 100%)" }}
      >
        {/* SKY */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: skyY }} aria-hidden>
          <div className="absolute inset-0 opacity-40">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${(i * 17) % 100}%`,
                  top: `${(i * 23) % 70}%`,
                  width: `${(i % 3) + 1}px`,
                  height: `${(i % 3) + 1}px`,
                  opacity: 0.3 + (i % 5) * 0.1,
                }}
              />
            ))}
          </div>
          <div
            className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(212,255,61,0.15) 0%, transparent 60%)" }}
          />
        </motion.div>

        {/* STADIUM */}
        <motion.div className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none" style={{ y: midY }} aria-hidden>
          <svg viewBox="0 0 1440 400" className="absolute bottom-0 w-full h-auto" preserveAspectRatio="none">
            <defs>
              <linearGradient id="stadium-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a1628" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0a1628" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <path
              d="M0,400 L0,280 Q200,180 400,200 Q600,140 720,160 Q840,140 1040,200 Q1240,180 1440,280 L1440,400 Z"
              fill="url(#stadium-grad)"
            />
            <g opacity="0.7">
              <circle cx="200" cy="150" r="4" fill="#d4ff3d" />
              <circle cx="400" cy="120" r="4" fill="#d4ff3d" />
              <circle cx="720" cy="100" r="5" fill="#d4ff3d" />
              <circle cx="1040" cy="120" r="4" fill="#d4ff3d" />
              <circle cx="1240" cy="150" r="4" fill="#d4ff3d" />
            </g>
          </svg>
        </motion.div>

        {/* FLOATING FLAGS */}
        <div className="absolute inset-0">
          {FLOATING_FLAGS.map((flag) => (
            <FloatingFlag key={flag.code} {...flag} scrollY={smoothScroll} />
          ))}
        </div>

        {/* FOREGROUND */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
          style={{ y: fgY, opacity: heroFade, scale: heroScale }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--paper)]/30 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--paper)]/80 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            FIFA World Cup · USA · Canada · Mexico
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="font-display text-[18vw] md:text-[10vw] leading-[0.85] font-black tracking-[-0.04em] text-[var(--paper)]"
          >
            <motion.span
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              wm
            </motion.span>
            <motion.span
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="block italic text-[var(--accent)]"
            >
              flow
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 max-w-xl text-lg md:text-xl text-[var(--paper)]/75 leading-relaxed"
          >
            {t("subtitle")}
            <br />
            {t("description")}
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-14"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--paper)]/60 mb-4">
              {t("countdownIn")}
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-5">
              <CountdownUnit value={countdown.days} label={t("days")} />
              <CountdownUnit value={countdown.hours} label={t("hours")} />
              <CountdownUnit value={countdown.minutes} label={t("minutes")} />
              <CountdownUnit value={countdown.seconds} label={t("seconds")} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="mt-8"
            >
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/gruppen"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--paper)] transition-colors"
                >
                  {t("ctaGroups")}
                </Link>
                <Link
                  href="/spiele"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--paper)]/40 text-[var(--paper)] font-bold text-sm hover:bg-[var(--paper)]/10 transition-colors"
                >
                  {t("ctaSchedule")}
                </Link>
                <Link
                  href="/stadien"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--paper)]/40 text-[var(--paper)] font-bold text-sm hover:bg-[var(--paper)]/10 transition-colors"
                >
                  {t("ctaVenues")}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <div className="bg-[var(--accent)] text-[var(--ink)] py-3 overflow-hidden select-none">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex items-center gap-0 shrink-0">
              {[
                `48 ${t("statsTeams")}`,
                `104 ${t("statsMatches")}`,
                `16 ${t("statsVenues")}`,
                locale === "en" ? "3 Nations" : "3 Länder",
                "11. Juni 2026",
                "FIFA World Cup",
                "USA · Canada · Mexico",
              ].map((item) => (
                <span key={item} className="flex items-center">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] px-6">{item}</span>
                  <span className="text-[var(--ink)]/40 text-xs">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* NÄCHSTE SPIELE */}
      {upcomingMatches.length > 0 && (
        <section className="py-24 px-6 bg-[var(--paper)]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mb-10"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-3">
                {t("upcomingLabel")}
              </div>
              <h2 className="font-display text-4xl md:text-6xl font-black leading-[0.95] tracking-tight">
                {t("upcoming")}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {upcomingMatches.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-[var(--ink)]/10 bg-white/60 p-6 flex flex-col gap-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted)]">
                      {tp(m.phase as keyof typeof tp)}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--muted)]">#{m.matchNumber}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-center flex-1">
                      {m.homeTeam ? (
                        <>
                          <span className={`fi fi-${m.homeTeam.flagUrl} rounded-sm block mx-auto mb-2`} style={{ fontSize: "2.2rem" }} />
                          <div className="text-xs font-medium leading-tight">{teamName(m.homeTeam)}</div>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-6 bg-[var(--ink)]/8 rounded mx-auto mb-2" />
                          <div className="text-[10px] font-mono text-[var(--muted)] leading-tight">{m.homePlaceholder}</div>
                        </>
                      )}
                    </div>
                    <div className="font-mono text-lg font-black text-[var(--ink)]/20 shrink-0">vs</div>
                    <div className="text-center flex-1">
                      {m.awayTeam ? (
                        <>
                          <span className={`fi fi-${m.awayTeam.flagUrl} rounded-sm block mx-auto mb-2`} style={{ fontSize: "2.2rem" }} />
                          <div className="text-xs font-medium leading-tight">{teamName(m.awayTeam)}</div>
                        </>
                      ) : (
                        <>
                          <div className="w-9 h-6 bg-[var(--ink)]/8 rounded mx-auto mb-2" />
                          <div className="text-[10px] font-mono text-[var(--muted)] leading-tight">{m.awayPlaceholder}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--ink)]/8">
                    <div className="text-[10px] font-mono text-[var(--muted)]">
                      {fmtShort.format(new Date(m.kickoffUtc))}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--ink)]/40 mt-0.5">{m.city}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 flex gap-4"
            >
              <Link
                href="/spiele"
                className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-4 py-2 rounded-sm hover:border-[var(--ink)]/50"
              >
                {t("viewAll")}
              </Link>
              <Link
                href="/bracket"
                className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--muted)] hover:text-[var(--ink)] transition-colors border border-[var(--ink)]/20 px-4 py-2 rounded-sm hover:border-[var(--ink)]/50"
              >
                {t("viewBracket")}
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="relative py-32 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
            {t("featLabel")}
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-black leading-[0.95] tracking-tight max-w-3xl">
            {t("featHeadline1")}
            <br />
            <span className="italic">{t("featHeadline2")}</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            { num: t("feat1Num"), title: t("feat1Title"), desc: t("feat1Desc") },
            { num: t("feat2Num"), title: t("feat2Title"), desc: t("feat2Desc") },
            { num: t("feat3Num"), title: t("feat3Title"), desc: t("feat3Desc") },
          ].map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group relative"
            >
              <div className="font-mono text-xs text-[var(--accent-2)] mb-4">{f.num}</div>
              <h3 className="font-display text-2xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
                {f.title}
              </h3>
              <p className="text-[var(--ink)]/70 leading-relaxed">{f.desc}</p>
              <div className="mt-6 h-px w-full bg-[var(--ink)]/15 group-hover:bg-[var(--accent-2)] transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 px-6 bg-[var(--ink)] text-[var(--paper)] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-14"
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent)] mb-3">
              {t("timelineLabel")}
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black leading-[0.95]">
              {t("timelineTitle")}
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-[22px] left-0 right-0 h-px bg-[var(--paper)]/15" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
              {timelineItems.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="relative"
                >
                  <div
                    className="w-[10px] h-[10px] rounded-full mb-5 border-2"
                    style={{
                      backgroundColor: item.accent ? "var(--accent)" : "transparent",
                      borderColor: item.accent ? "var(--accent)" : "rgba(244,237,224,0.3)",
                    }}
                  />
                  <div
                    className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5"
                    style={{ color: item.accent ? "var(--accent)" : "rgba(244,237,224,0.5)" }}
                  >
                    {item.dates}
                  </div>
                  <div
                    className="font-display text-lg font-black leading-tight mb-1"
                    style={{ color: item.accent ? "var(--accent)" : "var(--paper)" }}
                  >
                    {item.phase}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--paper)]/30">
                    {item.matches} {item.matches === 1 ? t("matchSingular") : t("matchPlural")}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--ink)] text-[var(--paper)] px-6 pt-20 pb-10 overflow-hidden relative">
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 font-display font-black leading-none text-[var(--paper)]/[0.03] select-none pointer-events-none text-center"
          style={{ fontSize: "clamp(6rem, 20vw, 18rem)" }}
        >
          wmflow
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-12">
            <div>
              <div className="font-display text-5xl md:text-7xl font-black leading-none tracking-tight mb-3">
                wm<span className="text-[var(--accent)]">flow</span>
              </div>
              <p className="text-[var(--paper)]/40 text-sm font-mono max-w-xs">
                {t("footerTagline")}
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {(
                [
                  { href: "/gruppen" as const, labelKey: "nav.groups" },
                  { href: "/spiele"  as const, labelKey: "nav.schedule" },
                  { href: "/bracket" as const, labelKey: "nav.knockout" },
                  { href: "/stadien" as const, labelKey: "nav.venues" },
                ] as const
              ).map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--paper)]/50 hover:text-[var(--accent)] transition-colors"
                >
                  {labelKey === "nav.groups" ? t("ctaGroups").replace(" →", "") :
                   labelKey === "nav.schedule" ? t("ctaSchedule").replace(" →", "") :
                   labelKey === "nav.knockout" ? "KO" :
                   t("ctaVenues").replace(" →", "")}
                </Link>
              ))}
            </nav>
          </div>
          <div className="h-px bg-[var(--paper)]/10 mb-8" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono text-[var(--paper)]/25">
            <span>© {new Date().getFullYear()} wmflow · {t("copyright")}</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              USA · Canada · Mexico · 11. Juni – 19. Juli 2026
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
