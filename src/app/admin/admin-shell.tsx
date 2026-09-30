"use client";

import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/admin-nav";
import ToastProvider from "@/components/ui/toast-provider";
import { demoAdmin } from "@/lib/admin-demo";

/**
 * Admin shell: sidebar + the main column the pages render into.
 *
 * This is a client component on purpose. The layout stays a thin server
 * component (it owns `metadata` and the stylesheet) and delegates here, so the
 * shell is a single client instance that survives navigation between admin
 * pages — only the main column is re-rendered.
 *
 * It also means `demoAdmin` resolves to the real object. Read from the server
 * layout it was a client-reference proxy, so the nav rendered an empty name and
 * an undefined email.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
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
