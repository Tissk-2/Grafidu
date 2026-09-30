import AdminShell from "./admin-shell";
import "./admin.css";

export const metadata = {
  title: "Admin Sekolah — Grafidu",
};

// Frontend-only: the real implementation adds the admin session guard here
// (server-side requireUser("admin") equivalent) before rendering children.
//
// Kept as a thin server component so it can own `metadata` and the stylesheet,
// while the shell itself is a client component (see admin-shell.tsx) so it is
// preserved across navigation.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
