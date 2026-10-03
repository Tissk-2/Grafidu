import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";

export const metadata = {
  title: "Halaman Tidak Ditemukan — Grafidu",
};

export default function NotFound() {
  return (
    <>
      <BodySync className="landing" />

      <header className="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            <Image src="/assets/logo.png" alt="Grafidu" width={20} height={20} />
            <span>GRAFIDU</span>
          </Link>
          <div className="nav-right">
            <Link className="btn btn-primary btn-sm" href="/">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      <main
        id="main"
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "120px 24px 160px",
          textAlign: "center",
        }}
      >
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
          Error 404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 64px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            margin: "0 0 18px",
          }}
        >
          Halaman ini
          <br />
          <span style={{ color: "var(--purple)" }}>tidak ditemukan</span>.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--gray-3)", maxWidth: 420, margin: "0 auto 32px" }}>
          Alamat yang Anda buka mungkin sudah dipindah atau salah ketik. Coba kembali ke beranda,
          atau hubungi kami jika ini seharusnya halaman yang valid.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/">
            Kembali ke Beranda
          </Link>
          <a className="btn btn-outline" href="/#contact">
            Hubungi Kami
          </a>
        </div>
      </main>
    </>
  );
}
