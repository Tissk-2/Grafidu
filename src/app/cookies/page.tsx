import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";
import SiteFooter from "@/components/landing/footer";

export const metadata = {
  title: "Kebijakan Cookie — Grafidu",
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
            <Link className="signin" href="/login">Sign in</Link>
            <Link className="btn btn-primary btn-sm" href="/signup">Try Grafidu</Link>
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
          <b>Cookie Notice</b>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", color: "var(--ink-1)" }}>
          Kebijakan Cookie
        </h1>
        <p style={{ color: "var(--gray-3)", fontSize: 14, margin: "0 0 40px" }}>
          Terakhir diperbarui: 22 September 2026
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
              2. Cookie pada Versi Demo Ini
            </h2>
            <p>
              Grafidu memakai <b>satu cookie wajib</b> (<code>grafidu_session</code>) untuk menjaga sesi login Anda — httpOnly, sehingga tidak bisa dibaca JavaScript. Cookie ini hilang otomatis saat Anda logout atau sesi kedaluwarsa (30 hari).
            </p>
            <p style={{ marginTop: 8 }}>
              Seluruh data yang Anda lihat (akun demo, nilai, tugas, kuis, dan preferensi) hanya berada di memori peramban selama sesi berlangsung. Memuat ulang halaman akan mengembalikan aplikasi ke kondisi awal, dan tidak ada data yang meninggalkan perangkat Anda.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink-1)", margin: "0 0 10px" }}>
              3. Pengelolaan Cookie
            </h2>
            <p>
              Karena versi demo ini tidak menempatkan cookie apa pun, tidak ada preferensi cookie yang perlu Anda kelola. Apabila versi produksi nantinya memerlukan cookie untuk autentikasi sesi, kebijakan ini akan diperbarui sebelum fitur tersebut aktif.
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
