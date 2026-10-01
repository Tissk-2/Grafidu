"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

/**
 * Auto auth client-side: kalau browser masih punya sesi Supabase,
 * langsung lempar ke dashboard. Dipakai di landing (/) dan halaman auth
 * sebagai cadangan kalau redirect server/middleware tidak jalan
 * (mis. halaman ter-cache statis atau cookie belum sinkron).
 */
export default function AutoRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user || cancelled) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        const role = (profile as { role?: string } | null)?.role;
        if (role && !cancelled) router.replace(dashboardPath(role));
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
