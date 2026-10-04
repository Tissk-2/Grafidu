"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/home";
  if (role === "admin") return "/admin";
  return "/student/home";
}

export default function NavHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    const sections = ["platform", "students", "teachers", "ai", "testimoni", "harga", "faq", "contact"];
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveHash("#" + id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Burger menu: kunci scroll body saat terbuka, tutup dengan Escape, dan
  // tutup otomatis kalau layar dilebarkan melewati breakpoint burger (760px).
  useEffect(() => {
    document.body.classList.toggle("sheet-open", mobileOpen);
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 760) setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("sheet-open");
    };
  }, [mobileOpen]);

  // Kalau sudah login, nav kanan jadi tombol Dashboard (auto auth UX).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sessionUser = await getSessionUser();
        if (!sessionUser || cancelled) return;
        setDashboardHref(dashboardPath(sessionUser.role));
      } catch {
        // Abaikan — tetap tampil Sign in.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link className="brand" href="/">
            <Image src="/assets/logo.png" alt="Grafidu" width={20} height={20} />
            <span>GRAFIDU</span>
          </Link>
          <nav className="nav-links">
            <a href="#platform" className={activeHash === "#platform" ? "active" : ""}>
              Platform
            </a>
            <a href="#students" className={activeHash === "#students" ? "active" : ""}>
              Siswa
            </a>
            <a href="#teachers" className={activeHash === "#teachers" ? "active" : ""}>
              Guru
            </a>
            <a href="#ai" className={activeHash === "#ai" ? "active" : ""}>
              AI
            </a>
            <a href="#harga" className={activeHash === "#harga" ? "active" : ""}>
              Harga
            </a>
            <a href="#faq" className={activeHash === "#faq" ? "active" : ""}>
              FAQ
            </a>
            <a href="#contact" className={activeHash === "#contact" ? "active" : ""}>
              Kontak
            </a>
          </nav>
          <div className="nav-right">
            <ThemeToggle />
            {dashboardHref ? (
              <Link className="btn btn-primary btn-sm" href={dashboardHref}>
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link className="signin" href="/login">
                  Masuk
                </Link>
                <a className="btn btn-primary btn-sm" href="#contact">
                  Coba Grafidu
                </a>
              </>
            )}
            <button
              className="nav-burger"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ============ MOBILE NAV SHEET ============ */}
      <div
        className={"nav-sheet" + (mobileOpen ? " open" : "")}
        id="mobile-nav"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div className="nav-sheet-head">
          <Link className="brand" href="/" onClick={() => setMobileOpen(false)}>
            <Image src="/assets/logo.png" alt="Grafidu" width={20} height={20} />
            <span>GRAFIDU</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <button className="nav-sheet-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav aria-label="Mobile">
          <a href="#platform" onClick={() => setMobileOpen(false)}>Platform</a>
          <a href="#students" onClick={() => setMobileOpen(false)}>Siswa</a>
          <a href="#teachers" onClick={() => setMobileOpen(false)}>Guru</a>
          <a href="#ai" onClick={() => setMobileOpen(false)}>AI</a>
          <a href="#harga" onClick={() => setMobileOpen(false)}>Harga</a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          <a href="#contact" onClick={() => setMobileOpen(false)}>Kontak</a>
        </nav>
        <div className="nav-sheet-ctas">
          {dashboardHref ? (
            <Link className="btn btn-primary" href={dashboardHref} onClick={() => setMobileOpen(false)}>
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn-outline" href="/login" onClick={() => setMobileOpen(false)}>
                Masuk
              </Link>
              <a className="btn btn-primary" href="#contact" onClick={() => setMobileOpen(false)}>
                Coba Grafidu
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}