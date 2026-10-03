import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grafidu",
    short_name: "Grafidu",
    description:
      "Grafidu menyatukan nilai, materi guru, penugasan, dan rekomendasi AI dalam satu dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#751EF8",
    icons: [
      {
        src: "/assets/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
