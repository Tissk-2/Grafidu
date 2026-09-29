import AdminSettingsForm from "@/components/admin/admin-settings-form";

export const metadata = {
  title: "Pengaturan Admin — Grafidu",
};

export default function AdminSettingsPage() {
  return (
    <>
      <div className="adm-head">
        <div>
          <h1 className="page-title">Pengaturan</h1>
          <p className="page-sub">Kelola profil dan keamanan akun staf sekolah Anda.</p>
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <AdminSettingsForm />
      </div>
    </>
  );
}
