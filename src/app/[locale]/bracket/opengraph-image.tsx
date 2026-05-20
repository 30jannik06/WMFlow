import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KO Bracket — wmflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a1628",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4ff3d", flexShrink: 0 }} />
        <div style={{ color: "rgba(244,237,224,0.5)", fontSize: "16px", letterSpacing: "0.2em" }}>
          FIFA World Cup 2026
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "24px", color: "rgba(212,255,61,0.7)", letterSpacing: "0.2em" }}>
          Tournament Bracket
        </div>
        <div style={{ fontSize: "120px", fontWeight: 900, lineHeight: 0.85, color: "#f4ede0", letterSpacing: "-0.04em" }}>
          KO Bracket
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "rgba(244,237,224,0.4)", fontSize: "18px" }}>
          R32 → R16 → QF → SF → Final
        </div>
        <div style={{ background: "#d4ff3d", color: "#0a1628", padding: "12px 28px", borderRadius: "100px", fontSize: "16px", fontWeight: 700 }}>
          wmflow.online/bracket
        </div>
      </div>
    </div>,
    { ...size },
  );
}
