import Link from "next/link";
import AccountManager from "@/components/admin/account-manager";

export const metadata = {
  title: "Akun Siswa — Grafidu Admin",
};

/** Tabel akun siswa: kolom Kelas dari enrollments, tanpa kolom Peran. */
export default function AdminStudentsPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/users" className="adm-backlink">
            ‹ Semua Akun
          </Link>
          <h1 className="page-title">Akun Siswa</h1>
          <p className="page-sub">
            Cari, buat, ubah, nonaktifkan, dan atur ulang kata sandi akun siswa.
          </p>
        </div>
      </div>
      <AccountManager role="student" />
    </>
  );
}
