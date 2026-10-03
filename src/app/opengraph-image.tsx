import { ImageResponse } from "next/og";

export const alt = "Grafidu — Tahu posisimu. Tahu langkah berikutnya.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #751EF8 0%, #5B2EE0 100%)",
          padding: 72,
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 700, letterSpacing: "0.08em" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#751EF8",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            G
          </div>
          GRAFIDU
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Nilai, tugas, dan materi
          </div>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            dalam satu dashboard.
          </div>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.85 }}>
            Satu platform untuk siswa, guru, dan sekolah.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, opacity: 0.7 }}>grafidu.com</div>
      </div>
    ),
    { ...size },
  );
}
