import Link from "next/link";
import Image from "next/image";
import BodySync from "@/components/body-sync";
import SiteFooter from "@/components/landing/footer";

export const metadata = {
  title: "Pertanyaan Umum (FAQ)",
  description:
    "Jawaban seputar platform Grafidu: rekomendasi AI, keamanan data, onboard sekolah, dan akses ponsel.",
  alternates: { canonical: "/faqs" },
};

const FAQS_DATA = [
  {
    q: "Apa itu Grafidu dan untuk siapa platform ini dibuat?",
    a: "Grafidu adalah platform pendidikan cerdas yang menghubungkan rapor nilai siswa, materi ajar guru, penugasan harian, dan rekomendasi AI personal. Platform ini dirancang khusus untuk siswa SMK/SMA (terutama kejuruan seperti Rekayasa Perangkat Lunak) dan para guru pengampu.",
  },
  {
    q: "Bagaimana cara AI di Grafidu memberikan rekomendasi belajar?",
    a: "AI Agent Grafidu menganalisis riwayat nilai per mata pelajaran dan tugas yang belum diselesaikan. Ketika sistem mendeteksi tren nilai menurun (misal Seni Budaya atau Fisika), AI secara otomatis menyusun rencana belajar harian dan kuis latihan berbasis materi resmi yang diunggah guru.",
  },
  {
    q: "Bagaimana cara guru membuat dan menerbitkan kuis otomatis?",
    a: "Guru cukup membuka menu Quiz Maker, memilih kelas tujuan, memasukkan topik materi (misal Teks Eksposisi atau Algoritma), memilih tingkat kesulitan, lalu menekan tombol 'Generate Kuis dengan AI'. Soal disusun dalam hitungan detik berdasarkan materi yang telah dibagikan, tersimpan sebagai draft, dan dapat ditayangkan ke siswa setelah guru meninjaunya.",
  },
  {
    q: "Apakah data nilai dan informasi siswa aman di Grafidu?",
    a: "Ya. Seluruh data akademik siswa dan akun guru dilindungi dengan enkripsi standar industri, autentikasi sesi terenkripsi, dan kepatuhan terhadap regulasi privasi data pendidikan.",
  },
  {
    q: "Bagaimana cara bergabung jika sekolah saya belum terdaftar?",
    a: "Akun Grafidu dibuat oleh admin sekolah melalui dashboard administrasi — baik akun siswa maupun guru. Jika sekolah Anda belum menjadi mitra, hubungi tim kami melalui halaman kontak untuk menjadwalkan demo dan proses onboarding.",
  },
  {
    q: "Apakah Grafidu dapat diakses melalui ponsel?",
    a: "Tentu. Grafidu dirancang dengan tata letak responsif penuh sehingga siswa dapat memeriksa tugas harian, membaca modul materi PDF, dan mengerjakan kuis latihan langsung dari smartphone maupun laptop sekolah.",
  },
];

export default function FAQsPage() {
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

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div className="crumbs" style={{ marginBottom: 20 }}>
          <Link href="/">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Beranda
          </Link>
          <span className="sep">/</span>
          <b>Pertanyaan Umum</b>
        </div>

        <div className="eyebrow" style={{ marginBottom: 12 }}>Pusat Bantuan &amp; Informasi</div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
          Pertanyaan yang Sering Diajukan
        </h1>
        <p style={{ fontSize: 16, color: "var(--gray-3)", lineHeight: 1.65, marginBottom: 40 }}>
          Temukan jawaban seputar penggunaan Grafidu, sistem penilaian terintegrasi, generator kuis AI, dan akun pembelajaran.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          {FAQS_DATA.map((faq, i) => (
            <div
              key={i}
              className="detail-card"
              style={{ padding: "24px 28px", border: "1px solid var(--line)" }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", margin: "0 0 10px" }}>
                {faq.q}
              </h3>
              <p style={{ fontSize: 14.5, color: "var(--gray-2)", lineHeight: 1.7, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            padding: "28px 32px",
            background: "var(--purple-soft)",
            border: "1px solid var(--purple-banner)",
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <b style={{ fontSize: 16, display: "block", color: "var(--purple)", marginBottom: 4 }}>
              Masih memiliki pertanyaan lain?
            </b>
            <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
              Tim pendamping dan support teknis Grafidu siap membantumu setiap saat.
            </span>
          </div>
          <Link href="/#contact" className="btn btn-primary btn-sm">
            Hubungi Tim Dukungan
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
