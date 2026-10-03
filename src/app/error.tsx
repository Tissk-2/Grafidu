"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console agar mudah dilaporkan; monitoring menyusul.
    console.error(error);
  }, [error]);

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "140px 24px 160px",
        textAlign: "center",
        fontFamily: "var(--font, sans-serif)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#8e8a8c",
          marginBottom: 16,
        }}
      >
          Terjadi Kesalahan
      </div>
      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 44px)",
          fontWeight: 600,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color: "#181516",
          margin: "0 0 18px",
        }}
      >
        Ada yang salah
        <br />
        <span style={{ color: "#751ef8" }}>di sisi kami</span>.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: "#70696b", margin: "0 auto 32px" }}>
        Coba muat ulang halaman ini. Kalau masalahnya berulang, hubungi kami di
        care@grafidu.com.
      </p>
      <button
        onClick={reset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 10,
          padding: "11px 20px",
          background: "#751ef8",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Coba Lagi
      </button>
    </main>
  );
}
