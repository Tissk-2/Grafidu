import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import ToastProvider from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Grafidu — Tahu posisimu. Tahu langkah berikutnya.",
    template: "%s — Grafidu",
  },
  description:
    "Grafidu menyatukan nilai, materi guru, penugasan, dan rekomendasi AI dalam satu dashboard agar siswa bisa bertindak dan guru bisa melihat kebutuhan kelas.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Grafidu",
    locale: "id_ID",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(inter.variable, interTight.variable, "font-sans", manrope.variable)}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
