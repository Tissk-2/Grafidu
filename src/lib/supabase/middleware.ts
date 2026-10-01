import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Satpam: cek cookie session Supabase di setiap request.
// Kalau belum login dan mau ke /student, /teacher, /admin -> tendang ke /login.
// Kalau sudah login tapi salah kamar (misal student ke /admin) -> arahkan ke kamar sendiri.
// Kalau sudah login dan buka /, /login, /signup, /forgot-password -> auto ke dashboard.
function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

async function getRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return (data as { role?: string } | null)?.role ?? null;
  } catch {
    return null;
  }
}
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Kalau .env.local belum diisi, jangan error - lewatkan saja (mode demo lama).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    path.startsWith("/student") ||
    path.startsWith("/teacher") ||
    path.startsWith("/admin");
  const isAuthPage =
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/signup" ||
    path.startsWith("/signup/") ||
    path === "/forgot-password" ||
    path.startsWith("/forgot-password/");
  const isLanding = path === "/";

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Auto auth: sudah login tapi buka landing / halaman auth -> lempar ke dashboard.
  // Hanya redirect kalau role ketemu; kalau profiles belum ada / RLS ketat,
  // biarkan halaman tampil agar tidak loop.
  if (user && (isAuthPage || isLanding)) {
    const role = await getRole(supabase, user.id);
    if (role) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath(role);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Sudah login: cek role dari tabel profiles untuk cegah salah kamar.
  // Kalau tabel profiles belum ada / RLS ketat, gagal cek = lewatkan saja.
  if (user && isProtected) {
    const role = await getRole(supabase, user.id);

    if (role) {
      const wantStudent = path.startsWith("/student");
      const wantTeacher = path.startsWith("/teacher");
      const wantAdmin = path.startsWith("/admin");
      const ok =
        (role === "student" && wantStudent) ||
        (role === "teacher" && wantTeacher) ||
        (role === "admin" && wantAdmin);
      if (!ok) {
        const url = request.nextUrl.clone();
        url.pathname = dashboardPath(role);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
