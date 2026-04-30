import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Gruppe — wmflow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = Promise<{ code: string }>;

export default async function OgImage({ params }: { params: Params }) {
  const { code } = await params;
  const groupCode = code.toUpperCase();

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
            {`FIFA World Cup 2026 · wmflow`}
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Badge + label row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#d4ff3d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: 900,
                color: "#0a1628",
              }}
            >
              {groupCode}
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ fontSize: "22px", color: "rgba(10,22,40,0.4)", letterSpacing: "0.2em" }}>
                Gruppenphase
              </div>
            </div>
          </div>

          {/* Big title */}
          <div style={{ display: "flex" }}>
            <div style={{ fontSize: "130px", fontWeight: 900, lineHeight: 0.85, color: "#0a1628", letterSpacing: "-0.04em" }}>
              {`Gruppe ${groupCode}`}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "rgba(10,22,40,0.4)", fontSize: "18px" }}>
            Tabelle · Ergebnisse · Head-to-Head
          </div>
          <div style={{ background: "#0a1628", color: "#d4ff3d", padding: "12px 28px", borderRadius: "100px", fontSize: "16px", fontWeight: 700 }}>
            wmflow.de
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
