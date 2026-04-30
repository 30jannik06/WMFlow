import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gruppen — wmflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f4ede0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top label */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff4d2e", flexShrink: 0 }} />
          <div style={{ color: "rgba(10,22,40,0.4)", fontSize: "16px", letterSpacing: "0.2em" }}>
            FIFA World Cup 2026
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex" }}>
            <div style={{ fontSize: "24px", color: "rgba(10,22,40,0.5)", letterSpacing: "0.2em" }}>
              Gruppenphase
            </div>
          </div>
          <div style={{ fontSize: "140px", fontWeight: 900, lineHeight: 0.85, color: "#0a1628", letterSpacing: "-0.04em" }}>
            Gruppen
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "rgba(10,22,40,0.4)", fontSize: "18px" }}>
            12 Gruppen · 48 Teams · wmflow
          </div>
          <div style={{ background: "#0a1628", color: "#d4ff3d", padding: "12px 28px", borderRadius: "100px", fontSize: "16px", fontWeight: 700 }}>
            wmflow.de/gruppen
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
