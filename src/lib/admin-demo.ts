"use client";

/**
 * Demo persona + helpers for the frontend-only admin pages. The real admin
 * session replaces these when the backend pass wires Supabase/role guards.
 */

export const demoAdmin = {
  name: "Admin Grafidu",
  email: "admin@grafidu.sch.id",
};

/** Cryptographically random temporary password, shown once to the admin. */
export function generateTemporaryPassword(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
