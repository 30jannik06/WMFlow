import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "wmflow — FIFA World Cup 2026 Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
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
        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "rgba(244,237,224,0.5)",
            fontSize: "16px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4ff3d" }} />
          FIFA World Cup 2026
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              fontSize: "180px",
              fontWeight: 900,
              lineHeight: 0.85,
              color: "#f4ede0",
              letterSpacing: "-0.04em",
            }}
          >
            wm
          </div>
          <div
            style={{
              fontSize: "180px",
              fontWeight: 900,
              lineHeight: 0.85,
              color: "#d4ff3d",
              letterSpacing: "-0.04em",
              fontStyle: "italic",
            }}
          >
            flow
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "rgba(244,237,224,0.4)", fontSize: "18px", letterSpacing: "0.1em" }}>
            48 Teams · 104 Spiele · 3 Länder
          </div>
          <div
            style={{
              background: "#d4ff3d",
              color: "#0a1628",
              padding: "12px 28px",
              borderRadius: "100px",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            wmflow.de
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
