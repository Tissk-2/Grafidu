import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";
import SiteFooter from "@/components/landing/footer";

export const metadata = {
  title: "Kebijakan Cookie",
  description:
    "Cookie yang digunakan Grafidu: satu cookie sesi esensial, tanpa cookie pelacak atau iklan.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <BodySync className="landing" />

      {/* Nav */}
      <header className="nav">
        <div className="container nav-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Link className="brand" href="/">
            <Image src="/assets/logo.png" alt="Grafidu" width={28} height={28} />
            <span>GRAFIDU</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link className="signin" href="/login">Masuk</Link>
            <Link className="btn btn-primary btn-sm" href="/#contact">Coba Grafidu</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 840, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div className="crumbs" style={{ marginBottom: 20 }}>
          <Link href="/">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Beranda
          </Link>
          <span className="sep">/</span>
          <b>Kebijakan Cookie</b>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", color: "var(--ink-1)" }}>
          Kebijakan Cookie
        </h1>
        <p style={{ color: "var(--gray-3)", fontSize: 14, margin: "0 0 40px" }}>
          Terakhir diperbarui: 3 Oktober 2026
        </p>

        <article className="legal-content" style={{ display: "grid", gap: 28, lineHeight: 1.7, color: "var(--ink-2)", fontSize: 15 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 10px" }}>
              1. Apa Itu Cookie?
            </h2>
            <p>
              Cookie adalah berkas teks kecil yang dapat disimpan pada peramban web atau perangkat Anda saat Anda mengunjungi sebuah situs. Cookie biasanya digunakan untuk mengenali sesi aktif, mengingat preferensi antarmuka, dan menjaga keamanan akun.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 10px" }}>
              2. Cookie yang Kami Gunakan
            </h2>
            <p>
              Grafidu memakai <b>satu cookie wajib</b> (<code>grafidu_session</code>) untuk menjaga
              sesi login Anda — berbentuk httpOnly sehingga tidak bisa dibaca JavaScript, dan hanya
              dikirim bersama permintaan menuju server Grafidu. Cookie ini hilang otomatis saat Anda
              logout atau sesi kedaluwarsa (30 hari).
            </p>
            <p style={{ marginTop: 8 }}>
              Cookie ini bersifat esensial: tanpanya Anda tidak dapat tetap masuk ke dashboard.
              Data akademik (nilai, tugas, kuis, dan materi) tersimpan pada basis data Grafidu di
              sisi server — bukan pada cookie.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 10px" }}>
              3. Cookie Lainnya dan Pengelolaan
            </h2>
            <p>
              Kami tidak menggunakan cookie pelacak, cookie iklan, ataupun cookie pihak ketiga,
              sehingga tidak ada preferensi cookie yang perlu Anda kelola dan tidak ada banner
              persetujuan yang diperlukan. Apabila kelak kami menambahkan cookie non-esensial
              (misalnya analitik), kebijakan ini akan diperbarui dan persetujuan akan diminta
              sebelum fitur tersebut aktif.
            </p>
            <p style={{ marginTop: 8 }}>
              Anda tetap dapat menghapus cookie <code>grafidu_session</code> kapan pun melalui
              pengaturan peramban — efeknya sama dengan logout.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 10px" }}>
              4. Hubungi Kami
            </h2>
            <p>
              Jika ada pertanyaan mengenai penggunaan cookie pada platform Grafidu, silakan hubungi tim kami di{" "}
              <a href="mailto:care@grafidu.com" style={{ color: "var(--purple)", fontWeight: 600 }}>care@grafidu.com</a>.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
