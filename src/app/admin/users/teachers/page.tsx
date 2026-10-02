import Link from "next/link";
import AccountManager from "@/components/admin/account-manager";

export const metadata = {
  title: "Akun Guru — Grafidu Admin",
};

/** Tabel akun guru: kolom Kelas / Mapel dari teachings, tanpa kolom Peran. */
export default function AdminTeachersPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/users" className="adm-backlink">
            ‹ Semua Akun
          </Link>
          <h1 className="page-title">Akun Guru</h1>
          <p className="page-sub">
            Cari, buat, ubah, nonaktifkan, dan atur ulang kata sandi akun guru.
          </p>
        </div>
      </div>
      <AccountManager role="teacher" />
    </>
  );
}
