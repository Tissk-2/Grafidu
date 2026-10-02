import { requireRole } from "@/lib/session";
import AdminShell from "./admin-shell";
import "./admin.css";

export const metadata = {
  title: "Admin Sekolah — Grafidu",
};

/**
 * Server-side guard: tanpa sesi → login; sesi bukan admin → dashboard
 * rolenya sendiri. Nama/email admin diteruskan ke shell agar sidebar
 * menampilkan identitas sungguhan.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return (
    <AdminShell name={user.name} email={user.email}>
      {children}
    </AdminShell>
  );
}
