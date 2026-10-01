/**
 * Kata sandi sementara acak, ditampilkan sekali kepada admin. Modul netral
 * (tanpa "use client") agar bisa dipakai komponen klien maupun route handler.
 */
export function generateTemporaryPassword(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
