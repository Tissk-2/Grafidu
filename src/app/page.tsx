import Image from "next/image";
import { redirect } from "next/navigation";
import BodySync from "@/components/body-sync";
import NavHeader from "@/components/landing/nav-header";
import ViewTabs from "@/components/landing/view-tabs";
import SiteFooter from "@/components/landing/footer";
import ScrollReveal from "@/components/landing/scroll-reveal";
import ContactForm from "@/components/landing/contact-form";
import AutoRedirect from "@/components/auth/auto-redirect";
import { getSessionUser } from "@/lib/session";

// Pastikan redirect server jalan tiap request, bukan hasil prerender statis.
export const dynamic = "force-dynamic";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

const FAQ_ITEMS = [
  {
    q: "Apa itu Grafidu, dan untuk siapa platform ini?",
    a: "Grafidu adalah platform pembelajaran yang menyatukan nilai, materi guru, penugasan, dan rekomendasi AI di satu tempat. Dibangun untuk siswa, guru, dan sekolah yang mendukung mereka — dengan fokus pada kelas SMA/SMK.",
  },
  {
    q: "Bagaimana cara kerja rekomendasi AI-nya?",
    a: "Dimulai dari hasil nyata. Saat riwayat nilai menunjukkan mapel lemah atau tugas yang belum selesai, Grafidu mengubahnya menjadi rencana belajar konkret dan kuis latihan dari materi yang sudah dibagikan guru — bukan konten generik.",
  },
  {
    q: "Apakah siswa harus memasukkan nilai sendiri?",
    a: "Siswa bisa mencatat hasil per mapel untuk membangun riwayat pribadi. Guru melihat pola kelas dari tugas dan penilaian yang mereka terbitkan, sehingga gambarannya tidak bergantung pada satu sisi saja.",
  },
  {
    q: "Apakah data siswa aman di Grafidu?",
    a: "Aman. Akun dipisahkan per peran dengan kontrol akses yang ketat, sesi login dilindungi cookie httpOnly, dan data akademik tidak pernah dijual atau dibagikan untuk iklan. Detail lengkap ada di Kebijakan Privasi kami.",
  },
  {
    q: "Bagaimana cara sekolah memulai?",
    a: "Guru atau koordinator kurikulum bisa menghubungi kami melalui formulir kontak di bawah. Kami membantu menyiapkan kelas, mengimpor daftar siswa, dan mendampingi guru di minggu pertama.",
  },
  {
    q: "Apakah Grafidu bisa dibuka dari ponsel?",
    a: "Bisa. Tata letaknya sepenuhnya responsif, jadi siswa bisa memeriksa tugas harian, membaca materi guru, dan mengerjakan kuis latihan dari ponsel sama nyamannya dengan laptop sekolah.",
  },
];

export default async function LandingPage() {
  // Auto auth (server): user yang sudah login tidak perlu lihat landing.
  // Kalau gagal di sini, <AutoRedirect/> di bawah tetap coba via client.
  try {
    const user = await getSessionUser();
    if (user) redirect(dashboardPath(user.role));
  } catch {
    // Abaikan — tampilkan landing seperti biasa.
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Grafidu",
        email: "care@grafidu.com",
        description:
          "Platform pendidikan B2B: nilai, materi guru, penugasan, dan rekomendasi AI dalam satu dashboard untuk sekolah.",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AutoRedirect />
      <BodySync className="landing" />
      <ScrollReveal />
      <a className="skip-link" href="#main">
        Lompat ke konten
      </a>

      {/* ============ NAV ============ */}
      <NavHeader />

      {/* ============ HERO ============ */}
      <section className="hero overflow-hidden pt-24 lg:pt-24 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-[1200px] mx-auto px-6 lg:px-10 items-center">
          <div>
            <div className="eyebrow">A clearer way to learn</div>
            <h1>
              Know where
              <br />
              you are.
              <span className="accent">Know what to do next.</span>
            </h1>
            <div className="hero-rule"></div>
            <p className="lead">
              Grafidu connects grades, teacher materials, assignments, and AI recommendations so
              students can act on weak areas — and teachers can see what the class needs.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href="/signup">
                Start with Grafidu
              </Link>
              <a className="btn btn-outline" href="#platform">
                See how it works
              </a>
            </div>
            <div className="hero-note">
              For students, teachers, and the people who support them.
            </div>
          </div>
          <div className="flex justify-center" aria-hidden="true">
            <Image
              className="max-w-full h-auto lg:scale-[1.6] lg:translate-x-[60px]"
              src="/assets/hero-left.png"
              width={2704}
              height={1806}
              sizes="(max-width: 900px) 100vw, 780px"
              priority
              alt="Preview dashboard"
            ></Image>
          </div>
        </div>
      </section>

      {/* ============ STRIP ============ */}
      <div className="strip">
        <div className="container strip-inner">
          <span className="l">Learning data should lead somewhere.</span>
          <span className="r">Grafidu turns “my score is low” into a practical next step.</span>
        </div>
      </div>

      {/* ============ PLATFORM ============ */}
      <section className="section" id="platform">
        <div className="container">
          <div className="sec-head reveal">
            <h2>
              Everything revolves around
              <br />
              one question:
              <br />
              <span className="accent u">what needs attention?</span>
            </h2>
            <p>
              No maze of menus. No pile of disconnected tools. Grafidu puts the useful parts of
              schoolwork in one place and keeps the path forward visible.
            </p>
            <span className="label-caps sec-label">The Platform</span>
          </div>
          <div className="rows reveal">
            <div className="row-item">
              <span className="num">01</span>
              <h3>Track the details</h3>
              <p>
                Students can enter results by subject and build a simple history of where their
                performance changes over time.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">02</span>
              <h3>Keep classwork close</h3>
              <p>
                Teachers share materials and tasks directly. Students get one place to find what
                they are supposed to learn.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">03</span>
              <h3>Ask the AI for a plan</h3>
              <p>
                When results show a weak area, Grafidu can turn it into a study plan or a quiz based
                on the material provided by the teacher.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">04</span>
              <h3>See the class clearly</h3>
              <p>
                Teachers can spot class-wide patterns, unfinished work, and students who may need a
                closer look without manually stitching the data together.
              </p>
              <span className="row-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GRADES BAND ============ */}
      <section className="grades-band" id="students">
        <div className="container grades-grid">
          <div className="grade-card reveal">
            <div className="grade-card-head">
              <b>Jessie Cooper · XI RPL B</b>
              <span>Current grades</span>
            </div>
            <div className="grade-row">
              <span>Matematika</span>
              <span className="score">80</span>
              <span className="pill pill-green">Above average</span>
            </div>
            <div className="grade-row">
              <span>Fisika</span>
              <span className="score">72</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-row">
              <span>Biologi</span>
              <span className="score">69</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-row">
              <span>Informatika</span>
              <span className="score">95</span>
              <span className="pill pill-green">Above average</span>
            </div>
            <div className="grade-row" style={{ borderBottom: "none" }}>
              <span>Seni Budaya</span>
              <span className="score">65</span>
              <span className="pill pill-red">Needs work</span>
            </div>
            <div className="grade-note">Focus on Seni Budaya first, then continue with Fisika.</div>
          </div>
          <div className="grades-copy reveal" data-delay="1">
            <span className="label-caps">For Students</span>
            <h2>
              Your grades
              <br />
              become a <span className="accent u">map</span>.
            </h2>
            <p>
              A low score shouldn’t be the end of the story. Grafidu helps connect that score to
              materials, practice, and a next session of focused study.
            </p>
            <ul className="grades-list">
              <li>
                <span className="n">01</span>
                <span>See which subjects are falling behind.</span>
              </li>
              <li>
                <span className="n">02</span>
                <span>Open the teacher’s material without hunting for it.</span>
              </li>
              <li>
                <span className="n">03</span>
                <span>Generate a realistic study plan instead of an overwhelming to-do list.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============ VIEWS TABS ============ */}
      <section className="section" id="teachers" style={{ paddingTop: 96 }}>
        <div className="container">
          <ViewTabs />
        </div>
      </section>

      {/* ============ AI SECTION ============ */}
      <section className="section" id="ai">
        <div className="container">
          <div className="sec-head reveal">
            <h2>
              Not “AI for AI’s sake.” Just a
              <br />
              better <span className="accent u">next step</span>.
            </h2>
            <p>
              Grafidu’s useful moment is not the chatbot. It is the connection between a student’s
              actual results and the material a teacher has already shared.
            </p>
            <span className="label-caps sec-label">AI, with context</span>
          </div>
          <div className="rows reveal" data-delay="1">
            <div className="row-item">
              <span className="num">01</span>
              <h3>Recommend</h3>
              <p>
                “Seni Budaya is your weakest subject right now.” The recommendation starts with
                something concrete.
              </p>
              <span className="row-icon">
                <span className="ai-txt">AI</span>
              </span>
            </div>
            <div className="row-item">
              <span className="num">02</span>
              <h3>Plan</h3>
              <p>
                Turn that gap into a manageable routine: what to review, how long to study, and what
                to do next.
              </p>
              <span className="row-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
            <div className="row-item">
              <span className="num">03</span>
              <h3>Practice</h3>
              <p>
                Generate a quiz from the teacher’s material so practice stays tied to what is
                actually being taught.
              </p>
              <span className="row-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <div className="strip">
        <div className="container strip-inner">
          <span className="l">
            <strong>12 schools</strong> across Indonesia run on Grafidu.
          </span>
          <span className="r">
            &ldquo;Grades and tasks finally live in one place.&rdquo; &mdash; Bu Septi Retno, Math
            Teacher
          </span>
        </div>
      </div>

      {/* ============ START CTA ============ */}
      <section className="start">
        <div className="container">
          <div className="start-grid reveal">
            <div>
              <span className="label-caps">Start Here</span>
              <h2>
                Make the next study session
                <br />
                kamu berada.
                <span className="accent">Tahu langkah berikutnya.</span>
              </h1>
              <div className="hero-rule"></div>
              <p className="lead">
                Grafidu menyatukan nilai, materi guru, penugasan, dan rekomendasi AI agar siswa
                bisa bertindak atas mapel yang lemah — dan guru bisa melihat apa yang dibutuhkan
                kelas.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#contact">
                  Mulai dengan Grafidu
                </a>
                <a className="btn btn-outline" href="#platform">
                  Lihat cara kerjanya
                </a>
              </div>
              <div className="hero-note">
                Untuk siswa, guru, dan sekolah yang mendukung mereka.
              </div>
            </div>
            <div className="" aria-hidden="true">
              <Image
                className="max-w-full h-auto"
                src="/assets/hero-left.png"
                style={{ transform: "scale(1.6) translateX(60px)" }}
                width={2704}
                height={1806}
                sizes="(max-width: 900px) 100vw, 780px"
                priority
                alt="Pratinjau dashboard"
              ></Image>
            </div>
          </div>
        </section>

        {/* ============ STRIP ============ */}
        <div className="strip">
          <div className="container strip-inner">
            <span className="l">Data belajar harus mengarah ke tindakan.</span>
            <span className="r">
              Grafidu mengubah &ldquo;nilaiku jelek&rdquo; menjadi langkah nyata berikutnya.
            </span>
          </div>
        </div>

        {/* ============ PLATFORM ============ */}
        <section className="section" id="platform">
          <div className="container">
            <div className="sec-head reveal">
              <h2>
                Semuanya berputar pada
                <br />
                satu pertanyaan:
                <br />
                <span className="accent u">apa yang perlu diperhatikan?</span>
              </h2>
              <p>
                Tanpa labirin menu. Tanpa tumpukan aplikasi terpisah. Grafidu menyatukan bagian
                penting pekerjaan sekolah di satu tempat dan menjaga langkah berikutnya tetap
                terlihat.
              </p>
              <span className="label-caps sec-label">Platform</span>
            </div>
            <div className="rows reveal">
              <div className="row-item">
                <span className="num">01</span>
                <h3>Catat detailnya</h3>
                <p>
                  Siswa bisa memasukkan hasil per mata pelajaran dan membangun riwayat sederhana
                  tentang kapan performa mereka berubah.
                </p>
                <span className="row-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </div>
              <div className="row-item">
                <span className="num">02</span>
                <h3>Tugas kelas selalu dekat</h3>
                <p>
                  Guru membagikan materi dan tugas langsung. Siswa punya satu tempat untuk
                  menemukan apa yang harus dipelajari.
                </p>
                <span className="row-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </div>
              <div className="row-item">
                <span className="num">03</span>
                <h3>Minta AI menyusun rencana</h3>
                <p>
                  Saat hasil menunjukkan area lemah, Grafidu mengubahnya menjadi rencana belajar
                  atau kuis berbasis materi yang dibagikan guru.
                </p>
                <span className="row-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </div>
              <div className="row-item">
                <span className="num">04</span>
                <h3>Lihat kelas dengan jelas</h3>
                <p>
                  Guru bisa melihat pola kelas, tugas yang belum selesai, dan siswa yang butuh
                  perhatian lebih — tanpa merangkai data secara manual.
                </p>
                <span className="row-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ GRADES BAND ============ */}
        <section className="grades-band" id="students">
          <div className="container grades-grid">
            <div className="grade-card reveal">
              <div className="grade-card-head">
                <b>Jessie Cooper · XI RPL B</b>
                <span>Nilai saat ini</span>
              </div>
              <div className="grade-row">
                <span>Matematika</span>
                <span className="score">80</span>
                <span className="pill pill-green">Di atas rata-rata</span>
              </div>
              <div className="grade-row">
                <span>Fisika</span>
                <span className="score">72</span>
                <span className="pill pill-red">Perlu latihan</span>
              </div>
              <div className="grade-row">
                <span>Biologi</span>
                <span className="score">69</span>
                <span className="pill pill-red">Perlu latihan</span>
              </div>
              <div className="grade-row">
                <span>Informatika</span>
                <span className="score">95</span>
                <span className="pill pill-green">Di atas rata-rata</span>
              </div>
              <div className="grade-row" style={{ borderBottom: "none" }}>
                <span>Seni Budaya</span>
                <span className="score">65</span>
                <span className="pill pill-red">Perlu latihan</span>
              </div>
              <div className="grade-note">Prioritaskan Seni Budaya dulu, lanjutkan ke Fisika.</div>
            </div>
            <div className="grades-copy reveal w-fit" data-delay="1">
              <span className="label-caps">Untuk Siswa</span>
              <h2>
                Nilaimu menjadi
                <br />
                sebuah <span className="accent u">peta</span>.
              </h2>
              <p>
                Nilai rendah bukan akhir cerita. Grafidu menghubungkan nilai tersebut dengan
                materi, latihan, dan sesi belajar fokus berikutnya.
              </p>
              <ul className="grades-list">
                <li>
                  <span className="n">01</span>
                  <span>Lihat mapel mana yang mulai tertinggal.</span>
                </li>
                <li>
                  <span className="n">02</span>
                  <span>Buka materi guru tanpa perlu mencari-cari.</span>
                </li>
                <li>
                  <span className="n">03</span>
                  <span>Buat rencana belajar yang realistis, bukan daftar tugas yang menakutkan.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ============ VIEWS TABS ============ */}
        <section className="section" id="teachers" style={{ paddingTop: 96 }}>
          <div className="container">
            <ViewTabs />
          </div>
        </section>

        {/* ============ AI SECTION ============ */}
        <section className="section" id="ai">
          <div className="container">
            <div className="sec-head reveal">
              <h2>
                Bukan &ldquo;AI demi AI.&rdquo; Hanya
                <br />
                langkah berikutnya yang
                <br />
                lebih <span className="accent u">terarah</span>.
              </h2>
              <p>
                Momen berguna Grafidu bukan pada chatbot-nya, melainkan koneksi antara hasil nyata
                siswa dan materi yang sudah dibagikan guru.
              </p>
              <span className="label-caps sec-label">AI dengan konteks</span>
            </div>
            <div className="rows reveal" data-delay="1">
              <div className="row-item">
                <span className="num">01</span>
                <h3>Rekomendasi</h3>
                <p>
                  &ldquo;Seni Budaya adalah mapel terlemahmu saat ini.&rdquo; Rekomendasi dimulai
                  dari hal yang konkret.
                </p>
                <span className="row-icon">
                  <span className="ai-txt">AI</span>
                </span>
              </div>
              <div className="row-item">
                <span className="num">02</span>
                <h3>Rencana</h3>
                <p>
                  Ubah ketertinggalan menjadi rutinitas yang masuk akal: apa yang diulang, berapa
                  lama belajar, dan apa langkah berikutnya.
                </p>
                <span className="row-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="row-item">
                <span className="num">03</span>
                <h3>Latihan</h3>
                <p>
                  Buat kuis dari materi guru agar latihan tetap terkait dengan apa yang
                  benar-benar diajarkan.
                </p>
                <span className="row-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONI ============ */}
        <section className="section" id="testimoni">
          <div className="container">
            <div className="sec-head reveal">
              <h2>
                Dipercaya sekolah
                <br />
                di <span className="accent u">Indonesia</span>.
              </h2>
              <p>
                Dari kelas pilot sampai sekolah penuh — guru pakai Grafidu untuk menyalurkan
                materi, menilai tugas, dan melihat perkembangan kelas tanpa kerja manual.
              </p>
              <span className="label-caps sec-label">Testimoni</span>
            </div>
            <div className="stats-row reveal">
              <div className="stat">
                <b>12</b>
                <span>Sekolah mitra</span>
              </div>
              <div className="stat">
                <b>90+</b>
                <span>Guru pengampu</span>
              </div>
              <div className="stat">
                <b>3.000+</b>
                <span>Siswa terbantu</span>
              </div>
            </div>
            <div className="testi-grid reveal" data-delay="1">
              <figure className="testi-card">
                <blockquote>
                  &ldquo;Nilai dan tugas akhirnya ada di satu tempat. Saya tidak lagi mengejar
                  lembaran Excel untuk tahu siapa yang tertinggal.&rdquo;
                </blockquote>
                <figcaption className="testi-who">
                  <Image
                    className="testi-photo"
                    src="/assets/bu-septi.png"
                    alt=""
                    width={44}
                    height={44}
                  />
                  <span>
                    <b>Bu Septi Retno</b>
                    <span>Guru Matematika, SMPN 7 Yogyakarta</span>
                  </span>
                </figcaption>
              </figure>
              <figure className="testi-card" data-delay="2">
                <blockquote>
                  &ldquo;Yang paling terasa: materi yang saya unggah langsung nyambung ke latihan
                  siswa. Tidak ada lagi &lsquo;Bu, materinya di mana?&rsquo;&rdquo;
                </blockquote>
                <figcaption className="testi-who">
                  <Image
                    className="testi-photo"
                    src="/assets/bu-citra.png"
                    alt=""
                    width={44}
                    height={44}
                  />
                  <span>
                    <b>Bu Citra Maharani</b>
                    <span>Wali Kelas XI RPL A, SMKN 2 Surabaya</span>
                  </span>
                </figcaption>
              </figure>
              <figure className="testi-card" data-delay="3">
                <blockquote>
                  &ldquo;Rata-rata kelas dan siswa yang perlu ditindaklanjuti tampil otomatis.
                  Rapat guru jadi bicara solusi, bukan mencari data.&rdquo;
                </blockquote>
                <figcaption className="testi-who">
                  <Image
                    className="testi-photo"
                    src="/assets/pak-arfan.png"
                    alt=""
                    width={44}
                    height={44}
                  />
                  <span>
                    <b>Pak Arfan Malik</b>
                    <span>Wakil Kurikulum, MAN 1 Bandung</span>
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ============ HARGA ============ */}
        <section className="section" id="harga" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-head reveal">
              <h2>
                Harga mengikuti
                <br />
                <span className="accent u">ukuran sekolah</span> Anda.
              </h2>
              <p>
                Grafidu dijual langsung ke sekolah — satu langganan untuk seluruh kelas, guru, dan
                siswa. Mulai dari pilot gratis, naik hanya saat Anda siap.
              </p>
              <span className="label-caps sec-label">Harga</span>
            </div>
            <div className="price-grid reveal" data-delay="1">
              <div className="price-card">
                <span className="plan-name">Kelas Percobaan</span>
                <div className="price">
                  Gratis
                  <span>/ 1 kelas pilot</span>
                </div>
                <ul className="price-feat">
                  <li>Hingga 40 siswa &amp; 4 guru</li>
                  <li>Tugas, materi, dan kuis dasar</li>
                  <li>Rekomendasi AI terbatas</li>
                  <li>Pendampingan onboarding</li>
                </ul>
                <a className="btn btn-outline" href="#contact">
                  Mulai Pilot
                </a>
              </div>
              <div className="price-card featured">
                <span className="plan-badge">Paling dipilih</span>
                <span className="plan-name">Sekolah</span>
                <div className="price">
                  Penawaran
                  <span>/ sesuai jumlah siswa</span>
                </div>
                <ul className="price-feat">
                  <li>Seluruh kelas &amp; guru tanpa batas</li>
                  <li>Dashboard guru + siswa lengkap</li>
                  <li>Rekomendasi AI penuh</li>
                  <li>Pelatihan guru di awal semester</li>
                </ul>
                <a className="btn btn-primary" href="#contact">
                  Minta Penawaran
                </a>
              </div>
              <div className="price-card">
                <span className="plan-name">Yayasan / Multi-Sekolah</span>
                <div className="price">
                  Kustom
                  <span>/ per kesepakatan</span>
                </div>
                <ul className="price-feat">
                  <li>Konsolidasi laporan lintas sekolah</li>
                  <li>Manajemen akun terpusat</li>
                  <li>Dukungan prioritas</li>
                  <li>SLA &amp; kontrak tahunan</li>
                </ul>
                <a className="btn btn-outline" href="#contact">
                  Hubungi Kami
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ START CTA ============ */}
        <section className="start">
          <div className="container">
            <div className="start-grid reveal">
              <div>
                <span className="label-caps">Mulai di sini</span>
                <h2>
                  Buat sesi belajar berikutnya
                  <br />
                  <span className="accent u">berarti</span>.
                </h2>
                <p className="lead">
                  Grafidu dibangun di atas ide sederhana: data akademik berguna ketika ada yang
                  bisa bertindak. Beri siswa arahan dan guru visibilitas.
                </p>
                <div className="start-ctas">
                  <a className="btn btn-primary" href="#contact">
                    Mulai dengan Grafidu
                  </a>
                  <a className="btn btn-outline" href="#platform">
                    Baca ringkasan platform
                  </a>
                </div>
              </div>
              <p className="start-note">
                Dirancang untuk keseharian sekolah: banyak mapel, banyak tugas, dan waktu terbatas
                untuk menentukan mana yang penting duluan.
              </p>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section className="section" id="faq" style={{ paddingTop: 96 }}>
          <div className="container">
            <div className="sec-head reveal">
              <h2>
                Pertanyaan yang sering
                <br />
                diajukan sebelum <span className="accent u">mulai</span>.
              </h2>
              <p>
                Jawaban singkat tentang cara kerja Grafidu, apa yang terjadi dengan data Anda, dan
                bagaimana sekolah mulai onboard. Ada yang kurang? Formulir kontak di bawah langsung
                menuju tim kami.
              </p>
              <span className="label-caps sec-label">FAQ</span>
            </div>
            <div className="faq-list reveal" data-delay="1">
              {FAQ_ITEMS.map((item, i) => (
                <details className="faq-item" key={i}>
                  <summary>
                    {item.q}
                    <span className="faq-icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="faq-a">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section className="contact" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy reveal">
              <span className="label-caps">Kontak</span>
              <h2>
                Bawa Grafidu
                <br />
                <span className="accent u">ke sekolah Anda.</span>
              </h2>
              <p>
                Grafidu dijual langsung ke sekolah dan institusi — satu dashboard untuk kelas,
                guru, dan siswa Anda. Ceritakan kebutuhan Anda dan tim kami akan menindaklanjuti
                dengan penawaran harga, demo, dan rencana onboarding.
              </p>
              <ul className="contact-channels">
                <li>
                  <span className="channel-ic" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 6h16v12H4z" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>
                  <div>
                    <b>Email</b>
                    <a href="mailto:care@grafidu.com">care@grafidu.com</a>
                  </div>
                </li>
                <li>
                  <span className="channel-ic" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" />
                    </svg>
                  </span>
                  <div>
                    <b>Telepon / WhatsApp</b>
                    <a href="tel:+6281234567890">+62 812-3456-7890</a>
                  </div>
                </li>
                <li>
                  <span className="channel-ic" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  <div>
                    <b>Berbasis di</b>
                    <span>Indonesia</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="contact-card reveal" data-delay="1">
              <h3>Mulai percakapan</h3>
              <p>Kami biasanya membalas dalam dua hari sekolah.</p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <SiteFooter />
    </>
  );
}
