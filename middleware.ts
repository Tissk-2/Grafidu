import { NextResponse, type NextRequest } from "next/server";

/**
 * Satpam tipis di edge: cukup cek ADA/TIDAKNYA cookie session.
 * Verifikasi token & role dilakukan di server (layout guard + server actions)
 * karena edge runtime tidak bisa mengakses Postgres.
 *
 * - Belum login + mau ke /student, /teacher, /admin -> tendang ke /login.
 * - Sudah login tapi buka /, /login, /forgot-password -> halaman
 *   server-nya sendiri yang me-redirect ke dashboard per role.
 * - Salah kamar (student ke /admin) -> layout area tersebut yang menendang.
 */
const SESSION_COOKIE = "grafidu_session";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/student") ||
    path.startsWith("/teacher") ||
    path.startsWith("/admin");

  if (!hasSession && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
