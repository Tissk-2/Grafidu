import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    ];
  },
};

export default nextConfig;
