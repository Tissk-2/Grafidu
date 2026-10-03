import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";
import SiteFooter from "@/components/landing/footer";

export const metadata = {
  title: "Keamanan Data",
  description:
    "Bagaimana Grafidu melindungi data akademik: kontrol akses per peran, sesi login terlindungi, penyimpanan terpusat, dan transparansi pemrosesan AI.",
  alternates: { canonical: "/keamanan" },
};

export default function KeamananPage() {
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
          <b>Keamanan Data</b>
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>Keamanan &amp; Kepercayaan</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 42px)", fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 12px" }}>
          Keamanan Data Grafidu
        </h1>
        <span style={{ fontSize: 13, color: "var(--gray-4)", display: "block", marginBottom: 36 }}>
          Terakhir diperbarui: 3 Oktober 2026
        </span>

        <div style={{ display: "grid", gap: 28, fontSize: 15, lineHeight: 1.75, color: "var(--gray-1)" }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              1. Prinsip Kami
            </h2>
            <p>
              Data akademik adalah data yang paling sensitif milik sekolah. Grafidu dirancang
              dengan prinsip akses seminimal mungkin: setiap peran hanya melihat data yang
              dibutuhkan perannya, dan seluruh akses melewati lapisan otorisasi di server — bukan
              sekadar disembunyikan di antarmuka.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              2. Kontrol Akses Berbasis Peran
            </h2>
            <p>
              Akun dipisahkan menjadi tiga peran — siswa, guru, dan admin sekolah — dengan
              pembatasan yang ketat:
            </p>
            <ul style={{ paddingLeft: 22, margin: "8px 0" }}>
              <li>Siswa hanya melihat kelas, tugas, materi, dan nilainya sendiri.</li>
              <li>Guru hanya melihat kelas yang diampunya, termasuk daftar siswa dan pekerjaan mereka di kelas tersebut.</li>
              <li>Admin sekolah mengelola akun, kelas, dan penugasan guru — dan tidak menggantikan peran guru dalam penilaian.</li>
            </ul>
            <p>
              Setiap permintaan ke data diverifikasi ulang di server, sehingga membuka URL langsung
              tanpa hak akses tidak memberikan apa pun.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              3. Sesi Login dan Kata Sandi
            </h2>
            <p>
              Kata sandi disimpan sebagai hash bcrypt dan tidak pernah tersimpan sebagai teks
              biasa. Sesi login dijaga cookie <code>grafidu_session</code> yang berbentuk httpOnly
              (tidak dapat dibaca JavaScript di peramban) dan otomatis berakhir setelah 30 hari
              atau saat logout. Detail cookie tersedia di{" "}
              <Link href="/cookies" style={{ color: "var(--purple)", fontWeight: 500 }}>
                Kebijakan Cookie
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              4. Penyimpanan Data
            </h2>
            <p>
              Seluruh data akademik tersimpan terpusat pada basis data Grafidu yang dikelola untuk
              sekolah mitra — bukan tersebar di perangkat siswa atau guru. Data tidak pernah
              dijual atau dibagikan kepada pihak ketiga untuk iklan, sesuai{" "}
              <Link href="/privacy" style={{ color: "var(--purple)", fontWeight: 500 }}>
                Kebijakan Privasi
              </Link>
              . Kepemilikan data akademik tetap pada sekolah; permintaan ekspor atau penghapusan
              data dapat diajukan kapan pun.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              5. Transparansi Pemrosesan AI
            </h2>
            <p>
              Rekomendasi belajar dan kuis latihan dihasilkan dari data akademik siswa (riwayat
              nilai, status tugas) yang digabungkan dengan materi yang dibagikan guru pengampu.
              Hasil AI bersifat pendamping — bukan penentu — dan selalu dapat ditinjau oleh guru.
              Kami mencantumkan prosesor AI pihak ketiga yang digunakan beserta jaminan bahwa
              datanya tidak digunakan untuk melatih model umum di halaman{" "}
              <Link href="/privacy" style={{ color: "var(--purple)", fontWeight: 500 }}>
                Kebijakan Privasi
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 10 }}>
              6. Laporkan Kerentanan
            </h2>
            <p>
              Menemukan celah keamanan? Laporkan ke{" "}
              <a href="mailto:care@grafidu.com" style={{ color: "var(--purple)", fontWeight: 500 }}>
                care@grafidu.com
              </a>{" "}
              dengan langkah pengefeksian ulang (reproduksi). Kami menindaklanjuti setiap laporan
              dan memberi kabar atas perkembangannya.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
