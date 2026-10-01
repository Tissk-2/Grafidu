import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name, email")
    .eq("id", user.id)
    .single();

  const role = (profile as { role?: string } | null)?.role;
  if (role && role !== "admin") {
    redirect(role === "teacher" ? "/teacher/home" : "/student/home");
  }

  return (
    <AdminShell
      name={(profile as { name?: string | null } | null)?.name || user.email || "Admin"}
      email={(profile as { email?: string | null } | null)?.email || user.email || ""}
    >
      {children}
    </AdminShell>
  );
}
