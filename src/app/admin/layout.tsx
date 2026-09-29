import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/admin-nav";
import ToastProvider from "@/components/ui/toast-provider";
import { demoAdmin } from "@/lib/admin-demo";
import "./admin.css";

export const metadata = {
  title: "Admin Sekolah — Grafidu",
};

// Frontend-only: the real implementation adds the admin session guard here
// (server-side requireUser("admin") equivalent) before rendering children.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <Link className="brand" href="/">
            <Image src="/assets/logo.png" alt="Grafidu" width={18} height={18} />
            <span>GRAFIDU</span>
          </Link>
          <span className="adm-role-tag">Staf Sekolah</span>
          <AdminNav name={demoAdmin.name} email={demoAdmin.email} />
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
