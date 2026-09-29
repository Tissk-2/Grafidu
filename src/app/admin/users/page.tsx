import AccountManager from "@/components/admin/account-manager";

export const metadata = {
  title: "Manajemen Akun — Grafidu Admin",
};

export default function AdminUsersPage() {
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
      <AccountManager />
    </>
  );
}
