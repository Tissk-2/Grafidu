"use client";

import Image from "next/image";
import Link from "next/link";
import AdminNav from "@/components/admin/admin-nav";
import ToastProvider from "@/components/ui/toast-provider";

/**
 * Admin shell: sidebar + the main column the pages render into.
 *
 * This is a client component on purpose. The layout stays a thin server
 * component (it owns `metadata`, the session guard, and the stylesheet) and
 * delegates here, so the shell is a single client instance that survives
 * navigation between admin pages — only the main column is re-rendered.
 * The signed-in admin's name/email come from the server layout as props.
 */
export default function AdminShell({
  children,
  name,
  email,
}: {
  children: React.ReactNode;
  name: string;
  email: string;
}) {
  return (
    <ToastProvider>
      <div className="adm-shell">
        <aside className="adm-sidebar">
          <Link className="brand" href="/">
            <Image src="/assets/logo.png" alt="Grafidu" width={18} height={18} />
            <span>GRAFIDU</span>
          </Link>
          <span className="adm-role-tag">Staf Sekolah</span>
          <AdminNav name={name} email={email} />
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
