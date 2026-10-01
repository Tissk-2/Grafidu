import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Grafidu — Know where you are. Know what to do next.",
  description:
    "Grafidu connects grades, teacher materials, assignments, and AI recommendations so students can act on weak areas — and teachers can see what the class needs.",
  icons: { icon: "/assets/logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, interTight.variable, "font-sans", manrope.variable)}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
