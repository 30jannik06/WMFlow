"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`text-[11px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-sm transition-colors cursor-pointer ${
            locale === l
              ? "text-[var(--ink)] bg-[var(--ink)]/10 font-bold"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
