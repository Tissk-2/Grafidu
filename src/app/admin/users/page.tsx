import Link from "next/link";
import { listAccounts } from "@/app/actions/admin";

export const metadata = {
  title: "Manajemen Akun — Grafidu Admin",
};

function StudentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/**
 * Pintu masuk Manajemen Akun: admin memilih dulu ingin melihat akun siswa
 * atau akun guru, lalu tabel yang tersaring peran itu terbuka di
 * /admin/users/students atau /admin/users/teachers — satu tabel per peran
 * dengan kolom yang relevan, bukan satu tabel campuran.
 */
export default async function AdminUsersPage() {
  let studentCount: number | null = null;
  let teacherCount: number | null = null;
  let loadError: string | null = null;
  try {
    const data = await listAccounts();
    studentCount = data.accounts.filter((a) => a.role === "student").length;
    teacherCount = data.accounts.filter((a) => a.role === "teacher").length;
  } catch (err) {
    loadError = (err as Error).message;
  }

  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="page-title">Manajemen Akun</h1>
          <p className="page-sub">
            Cari, buat, ubah, nonaktifkan, dan atur ulang kata sandi akun siswa serta guru.
          </p>
        </div>
      </div>

      {loadError ? (
        <p
          role="alert"
          style={{
            marginTop: 16,
            fontSize: 13.5,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--red-soft)",
            color: "#B0504C",
          }}
        >
          Gagal memuat data akun: {loadError}
        </p>
      ) : null}

      <div className="adm-pick-grid">
        <Link href="/admin/users/students" className="adm-pick">
          <span className="ic" aria-hidden="true">
            <StudentIcon />
          </span>
          <span className="pick-text">
            <b>Akun Siswa</b>
            <span>Kelas siswa, status aktif, dan kata sandi akun pelajar.</span>
          </span>
          <span className="count" aria-label={`${studentCount ?? "…"} akun siswa`}>
            {studentCount ?? "…"}
          </span>
        </Link>

        <Link href="/admin/users/teachers" className="adm-pick">
          <span className="ic" aria-hidden="true">
            <TeacherIcon />
          </span>
          <span className="pick-text">
            <b>Akun Guru</b>
            <span>Mapel, amanah kelas, dan status akun pengajar.</span>
          </span>
          <span className="count" aria-label={`${teacherCount ?? "…"} akun guru`}>
            {teacherCount ?? "…"}
          </span>
        </Link>
      </div>
    </>
  );
}
