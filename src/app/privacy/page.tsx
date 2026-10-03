import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";
import SiteFooter from "@/components/landing/footer";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Cara Grafidu mengumpulkan, menggunakan, dan melindungi data siswa, guru, dan sekolah mitra.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
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
          <b>Kebijakan Privasi</b>
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>Ketentuan Resmi &amp; Keamanan Data</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 12px" }}>
          Kebijakan Privasi
        </h1>
        <span style={{ fontSize: 13, color: "var(--gray-4)", display: "block", marginBottom: 36 }}>
          Terakhir diperbarui: 3 Oktober 2026
        </span>

        <div style={{ display: "grid", gap: 28, fontSize: 15, lineHeight: 1.75, color: "var(--gray-1)" }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              1. Komitmen Privasi Kami
            </h2>
            <p>
              Grafidu berkomitmen melindungi privasi siswa, guru, dan institusi pendidikan yang menggunakan platform kami. Dokumen ini menjelaskan jenis data yang kami kumpulkan, cara kami menggunakannya, dan langkah-langkah perlindungan data akademik yang kami terapkan.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              2. Data yang Dikumpulkan
            </h2>
            <p>
              Kami mengumpulkan informasi penting yang diperlukan untuk penyelenggaraan proses pembelajaran, meliputi:
            </p>
            <ul style={{ paddingLeft: 22, margin: "8px 0" }}>
              <li>Informasi identitas akun: nama lengkap, alamat email sekolah, kata sandi, nomor telepon, dan kelas.</li>
              <li>Data pembelajaran: riwayat nilai per mata pelajaran, status pengumpulan tugas, kuis latihan, dan catatan evaluasi guru.</li>
              <li>Riwayat interaksi asisten AI: pesan tanya jawab yang diajukan ke AI Agent untuk memberikan rekomendasi belajar yang akurat.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              3. Penggunaan Data Pembelajaran
            </h2>
            <p>
              Data yang dikumpulkan semata-mata digunakan untuk tujuan edukatif: menghitung progres ketuntasan belajar siswa, menyajikan analisis kelas bagi guru pengampu, dan melatih rekomendasi materi remedial yang relevan bagi tiap siswa.
            </p>
            <p>
              <b>Grafidu tidak pernah menjual, menyewakan, atau membagikan data siswa dan nilai akademik kepada pihak ketiga untuk kepentingan iklan komersial.</b>
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              4. Keamanan dan Penyimpanan Data
            </h2>
            <p>
              Kami menerapkan standar keamanan berlapis: kata sandi disimpan sebagai hash bcrypt,
              sesi login dijaga oleh cookie httpOnly (<code>grafidu_session</code>) yang tidak
              dapat dibaca JavaScript, dan pembatasan otorisasi berbasis peran (Role-Based Access
              Control) memisahkan akses akun siswa, guru, dan admin sekolah secara ketat. Data
              akademik tersimpan pada basis data yang dikelola untuk sekolah mitra dan hanya
              diproses untuk tujuan edukatif sebagaimana dijelaskan pada bagian 3.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              5. Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi atau ingin mengajukan permohonan pembaruan data, silakan hubungi tim kami di <a href="mailto:care@grafidu.com" style={{ color: "var(--purple)", fontWeight: 500 }}>care@grafidu.com</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
