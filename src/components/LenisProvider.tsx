"use client";

// app/_components/LenisProvider.tsx
// Aktiviert Lenis nur auf Routen die es brauchen (zunächst Landing).
// Für Phase 2+ einfach data-lenis-on-route="/" zu mehr Routen erweitern.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const ROUTES_WITH_LENIS = ["/", "/de", "/en"];

export default function LenisProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isEnabled = ROUTES_WITH_LENIS.includes(pathname);

    useEffect(() => {
        if (!isEnabled) return;

        const lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.2,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [isEnabled]);

    return <>{children}</>;
}
