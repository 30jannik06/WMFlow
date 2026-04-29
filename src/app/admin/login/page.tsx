import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--ink)] relative overflow-hidden">
      {/* subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--paper) 1px, transparent 1px), linear-gradient(90deg, var(--paper) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] mb-2">
            FIFA WM 2026
          </p>
          <h1 className="font-display text-5xl font-black text-[var(--paper)] leading-none">
            wm<span className="text-[var(--accent)]">flow</span>
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2 tracking-wide">Admin</p>
        </div>

        {/* Card */}
        <div className="w-full border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur p-8 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-[var(--paper)] font-medium">Anmelden</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Nur autorisierte Accounts erhalten Zugang
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/admin" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#5865F2] hover:bg-[#4752c4] active:scale-95 text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.037.052a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Mit Discord anmelden
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
