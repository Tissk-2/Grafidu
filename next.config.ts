import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fonts.googleapis.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
    ],
  },
  // The dashboard is per-class, so /teacher/home forwards to the first class.
  // Done here rather than with redirect() in the page because the teacher
  // layout renders the shell immediately, which flushes a 200 before a
  // page-level redirect() could turn into a 307.
  async redirects() {
    return [
      { source: "/teacher/home", destination: "/teacher/home/1", permanent: false },
      { source: "/student", destination: "/student/home", permanent: false },
    ];
  },
};

export default nextConfig;
