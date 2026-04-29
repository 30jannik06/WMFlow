"use client";

// app/page.tsx — wmflow Landing Page
// Editorial-Sport Aesthetic: Tiefes Marineblau + Säure-Gelb als Akzent
// 4 Parallax-Layer: Sky → Stadium → Floating Flags → Foreground
// Countdown mit 3D-Tiefen-Effekt
// Stack: Next.js App Router + framer-motion + Lenis (via Provider)

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// ==========================================
// CONFIG
// ==========================================
const WM_KICKOFF = new Date("2026-06-11T18:00:00Z"); // Estádio Azteca, Eröffnungsspiel

// 12 Beispiel-Flaggen für floating layer (echte Daten kommen aus DB)
// iso: ISO 3166-1 alpha-2 (für flag-icons), code: FIFA-3-Letter (für Label)
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

// ==========================================
// COUNTDOWN HOOK
// ==========================================
function useCountdown(target: Date) {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date()); // Hydration-safe
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

// ==========================================
// COUNTDOWN UNIT — mit 3D-Tiefen-Effekt
// ==========================================
function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40, rotateX: -30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
            {/* Schatten-Layer hinten (Tiefe) */}
            <div
                aria-hidden
                className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-2xl bg-[var(--accent)]/30 blur-sm"
            />
            <div
                aria-hidden
                className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-2xl bg-[var(--accent)]/60"
            />
            {/* Vordergrund */}
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

// ==========================================
// FLOATING FLAG (Parallax Layer 3)
// ==========================================
function FloatingFlag({
    iso,
    code,
    x,
    y,
    delay,
    scrollY,
}: {
    iso: string;
    code: string;
    x: string;
    y: string;
    delay: number;
    scrollY: any;
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
                transition={{
                    duration: 6 + delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="drop-shadow-2xl"
            >
                <span
                    className={`fi fi-${iso} rounded-sm`}
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1 }}
                />
            </motion.div>
            <div className="text-[10px] font-mono text-center mt-1 text-[var(--paper)]/80 tracking-widest">
                {code}
            </div>
        </motion.div>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function LandingPage() {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    // Smooth-Spring für alle Parallax-Werte
    const smoothScroll = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
    });

    // Layer-Speeds (von hinten nach vorne — je näher, desto schneller)
    const skyY = useTransform(smoothScroll, [0, 1], ["0%", "20%"]); // langsamster Layer
    const midY = useTransform(smoothScroll, [0, 1], ["0%", "50%"]); // Stadion
    const fgY = useTransform(smoothScroll, [0, 1], ["0%", "110%"]); // schnellster Layer
    const heroFade = useTransform(smoothScroll, [0, 0.8], [1, 0]);
    const heroScale = useTransform(smoothScroll, [0, 1], [1, 1.1]);

    const countdown = useCountdown(WM_KICKOFF);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // TODO: POST an /api/newsletter
        setSubmitted(true);
    }

    return (
        <main className="relative bg-[var(--paper)] text-[var(--ink)]">

            <div className="noise" />

            {/* ===========================================
          HERO — 4 Parallax Layer
          =========================================== */}
            <section
                ref={heroRef}
                className="relative h-[140vh] overflow-hidden"
                style={{
                    background:
                        "linear-gradient(180deg, #0a1628 0%, #1a2f4f 60%, #f4ede0 100%)",
                }}
            >
                {/* LAYER 1: SKY (langsamster) */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ y: skyY }}
                    aria-hidden
                >
                    <div className="absolute inset-0 opacity-40">
                        {/* Sterne / Lichter */}
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
                    {/* Großer Lichtschein */}
                    <div
                        className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[80%] rounded-full"
                        style={{
                            background:
                                "radial-gradient(ellipse, rgba(212,255,61,0.15) 0%, transparent 60%)",
                        }}
                    />
                </motion.div>

                {/* LAYER 2: STADIUM (Mid) */}
                <motion.div
                    className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
                    style={{ y: midY }}
                    aria-hidden
                >
                    {/* Stadion als SVG-Silhouette */}
                    <svg
                        viewBox="0 0 1440 400"
                        className="absolute bottom-0 w-full h-auto"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient
                                id="stadium-grad"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#0a1628"
                                    stopOpacity="0.4"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#0a1628"
                                    stopOpacity="0.95"
                                />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0,400 L0,280 Q200,180 400,200 Q600,140 720,160 Q840,140 1040,200 Q1240,180 1440,280 L1440,400 Z"
                            fill="url(#stadium-grad)"
                        />
                        {/* Flutlichter */}
                        <g opacity="0.7">
                            <circle cx="200" cy="150" r="4" fill="#d4ff3d" />
                            <circle cx="400" cy="120" r="4" fill="#d4ff3d" />
                            <circle cx="720" cy="100" r="5" fill="#d4ff3d" />
                            <circle cx="1040" cy="120" r="4" fill="#d4ff3d" />
                            <circle cx="1240" cy="150" r="4" fill="#d4ff3d" />
                        </g>
                    </svg>
                </motion.div>

                {/* LAYER 3: FLOATING FLAGS */}
                <div className="absolute inset-0">
                    {FLOATING_FLAGS.map((flag) => (
                        <FloatingFlag
                            key={flag.code}
                            iso={flag.iso}
                            code={flag.code}
                            x={flag.x}
                            y={flag.y}
                            delay={flag.delay}
                            scrollY={smoothScroll}
                        />
                    ))}
                </div>

                {/* LAYER 4: FOREGROUND CONTENT (schnellster) */}
                <motion.div
                    className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
                    style={{ y: fgY, opacity: heroFade, scale: heroScale }}
                >
                    {/* Editorial Tag */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--paper)]/30 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--paper)]/80 backdrop-blur"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        FIFA World Cup · USA · Canada · Mexico
                    </motion.div>

                    {/* Hauptheadline mit Editorial-Treatment */}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        className="font-display text-[18vw] md:text-[10vw] leading-[0.85] font-black tracking-[-0.04em] text-[var(--paper)]"
                    >
                        <motion.span
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.2,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="block"
                        >
                            wm
                        </motion.span>
                        <motion.span
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            transition={{
                                duration: 1,
                                delay: 0.4,
                                ease: [0.16, 1, 0.3, 1],
                            }}
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
                        48 Teams. 104 Spiele. Drei Länder.
                        <br />
                        Verfolge die WM 2026 in Echtzeit.
                    </motion.p>

                    {/* Countdown */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="mt-14"
                    >
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--paper)]/60 mb-4">
                            Anstoß in
                        </div>
                        <div className="grid grid-cols-4 gap-2 md:gap-5">
                            <CountdownUnit
                                value={countdown.days}
                                label="Tage"
                            />
                            <CountdownUnit
                                value={countdown.hours}
                                label="Std"
                            />
                            <CountdownUnit
                                value={countdown.minutes}
                                label="Min"
                            />
                            <CountdownUnit
                                value={countdown.seconds}
                                label="Sek"
                            />
                        </div>

                        {/* CTA → Gruppen */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.5 }}
                            className="mt-8"
                        >
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/gruppen"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent)] text-[var(--ink)] font-bold text-sm hover:bg-[var(--paper)] transition-colors"
                                >
                                    Gruppen ansehen →
                                </Link>
                                <Link
                                    href="/spiele"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--paper)]/40 text-[var(--paper)] font-bold text-sm hover:bg-[var(--paper)]/10 transition-colors"
                                >
                                    Spielplan →
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ===========================================
          FEATURES SECTION
          =========================================== */}
            <section className="relative py-32 px-6 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--muted)] mb-4">
                        Was dich erwartet
                    </div>
                    <h2 className="font-display text-5xl md:text-7xl font-black leading-[0.95] tracking-tight max-w-3xl">
                        Nicht noch ein
                        <br />
                        <span className="italic">Spielplan-Aggregator.</span>
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mt-20">
                    {[
                        {
                            num: "01",
                            title: "Gruppen-Grid",
                            desc: "12 Gruppen, 48 Teams, immer aktuelle Tabellen. Eine Übersicht statt zwölf Tabs.",
                        },
                        {
                            num: "02",
                            title: "Symmetrischer Bracket",
                            desc: "Der Turnierbaum, wie er sein sollte: Spiegelsymmetrie, klare Hierarchie, ab 1/4-Finale konvergent.",
                        },
                        {
                            num: "03",
                            title: "Live in deiner Zeit",
                            desc: "Anstoßzeiten automatisch in deiner Zeitzone. Kein Kopfrechnen mehr bei Spielen aus Mexiko-Stadt.",
                        },
                    ].map((f, i) => (
                        <motion.div
                            key={f.num}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative"
                        >
                            <div className="font-mono text-xs text-[var(--accent-2)] mb-4">
                                {f.num}
                            </div>
                            <h3 className="font-display text-2xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
                                {f.title}
                            </h3>
                            <p className="text-[var(--ink)]/70 leading-relaxed">
                                {f.desc}
                            </p>
                            <div className="mt-6 h-px w-full bg-[var(--ink)]/15 group-hover:bg-[var(--accent-2)] transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===========================================
          NEWSLETTER / LEAD-GEN
          =========================================== */}
            <section className="relative py-32 px-6 bg-[var(--ink)] text-[var(--paper)] overflow-hidden">
                {/* Decorative Number */}
                <div
                    aria-hidden
                    className="absolute -right-10 -top-20 font-display text-[40rem] font-black leading-none text-[var(--paper)]/5 select-none pointer-events-none"
                >
                    26
                </div>

                <div className="relative max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--accent)] mb-6">
                            · Nichts verpassen ·
                        </div>
                        <h2 className="font-display text-5xl md:text-7xl font-black leading-[0.95] mb-8">
                            Sei dabei,
                            <br />
                            <span className="italic text-[var(--accent)]">
                                wenn's losgeht.
                            </span>
                        </h2>
                        <p className="text-lg text-[var(--paper)]/70 mb-10 max-w-xl mx-auto">
                            Wir melden uns zum Launch — kein Spam, keine
                            Werbung, nur ein Update wenn wmflow live ist.
                        </p>

                        {!submitted ? (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="deine@email.de"
                                    className="flex-1 px-5 py-4 rounded-full bg-transparent border-2 border-[var(--paper)]/30 focus:border-[var(--accent)] outline-none transition-colors text-[var(--paper)] placeholder:text-[var(--paper)]/40"
                                />
                                <button
                                    type="submit"
                                    className="px-7 py-4 rounded-full bg-[var(--accent)] text-[var(--ink)] font-bold hover:bg-[var(--paper)] transition-colors"
                                >
                                    Anmelden →
                                </button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-block px-7 py-4 rounded-full bg-[var(--accent)] text-[var(--ink)] font-bold"
                            >
                                ✓ Check dein Postfach für die Bestätigung
                            </motion.div>
                        )}

                        <p className="mt-6 text-xs text-[var(--paper)]/40">
                            Mit dem Klick stimmst du der Datenschutzerklärung
                            zu. Abmeldung jederzeit möglich.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 px-6 text-center text-xs font-mono text-[var(--muted)]">
                wmflow · v0.1 · Pre-Launch · {new Date().getFullYear()}
            </footer>
        </main>
    );
}
