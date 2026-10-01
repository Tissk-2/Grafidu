import Link from "next/link";
import ClassDetailManager from "@/components/admin/class-detail-manager";

export const metadata = {
  title: "Detail Kelas — Grafidu Admin",
};

export default async function AdminClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <div className="adm-head">
        <div>
          <p style={{ fontSize: 12.5, color: "var(--gray-4)", marginBottom: 4 }}>
            <Link className="link-underline" href="/admin/classes">
              ← Semua kelas
            </Link>
          </p>
          <h1 className="page-title">Detail Kelas</h1>
          <p className="page-sub">Kelola nama, daftar siswa, dan penugasan guru pengampu.</p>
        </div>
      </div>

      <ClassDetailManager classId={id} />
    </>
  );
}
