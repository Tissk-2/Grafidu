import ClassManager from "@/components/admin/class-manager";

export const metadata = {
  title: "Manajemen Kelas — Grafidu Admin",
};

export default function AdminClassesPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="page-title">Manajemen Kelas</h1>
          <p className="page-sub">
            Buat kelas, lalu kelola daftar siswa dan penugasan guru pengampu di halaman detail.
          </p>
        </div>
      </div>
      <ClassManager />
    </>
  );
}
