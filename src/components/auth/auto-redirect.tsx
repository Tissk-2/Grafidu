"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

/**
 * Auto auth client-side: kalau browser masih punya session cookie yang valid,
 * langsung lempar ke dashboard. Dipakai di landing (/) dan halaman auth
 * sebagai cadangan kalau redirect server tidak jalan
 * (mis. halaman ter-cache statis atau cookie belum sinkron).
 */
export default function AutoRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getSessionUser();
        if (user && !cancelled) router.replace(dashboardPath(user.role));
      } catch {
        // Abaikan — biarkan halaman tampil.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
