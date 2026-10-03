import Image from "next/image";
import Link from "next/link";

export default function AuthLeft() {
  return (
    <aside className="auth-left">
      <Link className="auth-logo" href="/">
        <Image src="/assets/logo.png" alt="Grafidu" width={22} height={22} />
        <b>GRAFIDU</b>
      </Link>
      <div className="auth-hero">
        <div className="eyebrow">Cara belajar yang lebih jelas</div>
        <h1>
          Tahu di mana kamu
          <br />
          berada. Tahu{" "}
          <span className="accent">
            langkah
            <br />
            berikutnya.
          </span>
        </h1>
        <p>
          Nilai, materi, dan rekomendasi AI dalam satu tempat — setiap login dimulai dengan
          sesuatu yang berguna.
        </p>
      </div>

      {/* Panel ilustratif generik — bukan data user/demo dari database.
          Data asli hanya tampil setelah login, diambil dari database. */}
      <div className="auth-float-score" aria-hidden="true">
        <span className="ic">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </span>
        <span>
          <span>Nilai & tugas terpantau</span>
          <b>Real-time dari database</b>
        </span>
      </div>

      <div className="auth-float-grades" aria-hidden="true">
        <div className="head">
          <b>Ringkasan Belajar</b>
          <span>Grafidu</span>
        </div>
        <div className="afg-row">
          <span>Tugas & kuis</span>
          <span className="pill pill-green">Terjadwal</span>
        </div>
        <div className="afg-row">
          <span>Materi kelas</span>
          <span className="pill pill-green">Terpusat</span>
        </div>
        <div className="afg-row">
          <span>Rekomendasi AI</span>
          <span className="pill pill-green">Personal</span>
        </div>
      </div>

      <nav>
        <Link href="/#platform">Platform</Link>
        <Link href="/#students">Siswa</Link>
        <Link href="/#teachers">Guru</Link>
        <Link href="/#ai">AI</Link>
      </nav>
    </aside>
  );
}
