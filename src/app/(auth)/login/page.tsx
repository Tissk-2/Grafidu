import { redirect } from "next/navigation";
import AuthLeft from "@/components/auth/auth-left";
import AuthForm from "@/components/auth/auth-form";
import ToastProvider from "@/components/ui/toast-provider";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in — Grafidu",
};

export const dynamic = "force-dynamic";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

export default async function LoginPage() {
  // Auto auth: kalau sudah login, langsung lempar ke dashboard (server-side,
  // jadi tidak sempat render form). Gagal baca profile = biarkan form tampil.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const role = (profile as { role?: string } | null)?.role;
      if (role) redirect(dashboardPath(role));
    }
  } catch {
    // Abaikan — tampilkan form login seperti biasa.
  }

  return (
    <ToastProvider>
      <div className="auth">
        <AuthLeft />
        <main className="auth-right">
          <AuthForm />
        </main>
      </div>
    </ToastProvider>
  );
}