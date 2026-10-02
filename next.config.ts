import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit .next/standalone/server.js — entry point untuk deploy VPS
  // (`node server.js`) tanpa perlu node_modules lengkap di server.
  output: "standalone",
  experimental: {
    // Paket ikon/lokal yang berat — paksa tree-shaking per impor.
    optimizePackageImports: ["iconsax-reactjs", "date-fns"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fonts.googleapis.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
    ],
  },
  async redirects() {
    return [
      // /teacher/home tanpa :id sah — kelas aktif diambil dari shell context
      // (uuid dari database, tidak bisa lagi di-hardcode ke redirect).
      { source: "/student", destination: "/student/home", permanent: false },
      // Tidak ada pendaftaran mandiri: akun dibuat admin (sandi sementara +
      // wajib ganti di login pertama). Semua tautan /signup di landing, legal,
      // dan footer diarahkan ke login agar tidak 404.
      { source: "/signup", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
