"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function FooterArt() {
  const [markup, setMarkup] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/assets/footer-bg.svg")
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (!cancelled && text) setMarkup(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!markup) return <div className="footer-media" aria-hidden="true" />;
  return (
    <div className="footer-media" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
  );
}

export default function SiteFooter() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    // Newsletter hanya demo lokal (dulu in-memory store) — tidak ada penyimpanan.
    setEmail("");
    window.gtoast?.("Terima kasih! Kamu sudah terdaftar.");
  }

  return (
    <footer className="site-footer">
      <FooterArt />

      <div className="footer-inner">
        <div className="footer-grid">
          <div className="brand">
            <div className="brand-lockup">
              <Image className="brand-mark" src="/assets/logo.png" alt="" width={74} height={93} />
              <h2 className="brand-name">Grafidu</h2>
            </div>
            <p className="brand-blurb">
              Cara belajar yang lebih jelas &mdash; tahu posisimu, tahu langkah berikutnya.
            </p>
            <ul className="contact-list">
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M12 13.06 2.4 6.6C2.85 5.68 3.77 5 4.5 5h15c.86 0 1.61.43 2.06 1.1L12 13.06Z" />
                  <path d="M12 15.1 22 8.36V18.5c0 1.38-1.12 2.5-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V8.36l10 6.74Z" />
                </svg>
                <a href="mailto:care@grafidu.com">care@grafidu.com</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
                </svg>
                <a href="tel:+6281234567890">+62 812-3456-7890</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                </svg>
                <span>Indonesia</span>
              </li>
            </ul>
          </div>

          <nav className="col" aria-label="Siswa">
            <h3 className="col-title">Siswa</h3>
            <ul className="link-list">
              <li>
                <a href="#platform">Semua Mapel</a>
              </li>
              <li>
                <a href="#students">Matematika</a>
              </li>
              <li>
                <a href="#students">Fisika</a>
              </li>
              <li>
                <a href="#students">Biologi</a>
              </li>
              <li>
                <a href="#students">Informatika</a>
              </li>
              <li>
                <a href="#ai">Latihan Soal</a>
              </li>
            </ul>
          </nav>

          <nav className="col" aria-label="Platform">
            <h3 className="col-title">Platform</h3>
            <ul className="link-list">
              <li>
                <a href="#students">Untuk Siswa</a>
              </li>
              <li>
                <a href="#teachers">Untuk Guru</a>
              </li>
              <li>
                <a href="#ai">AI Agent</a>
              </li>
              <li>
                <a href="#students">Nilai &amp; Insight</a>
              </li>
              <li>
                <a href="#contact">Gabung</a>
              </li>
              <li>
                <a href="mailto:care@grafidu.com?subject=Kerja%20Sama%20Media">Kerja Sama Media</a>
              </li>
            </ul>
          </nav>

          <nav className="col" aria-label="Bantuan dan layanan">
            <h3 className="col-title">Bantuan &amp; Layanan</h3>
            <ul className="link-list">
              <li>
                <Link href="/faqs">FAQ</Link>
              </li>
              <li>
                <Link href="/keamanan">Keamanan Data</Link>
              </li>
              <li>
                <a href="#platform">Memulai</a>
              </li>
              <li>
                <a href="#contact">Kontak</a>
              </li>
              <li>
                <a href="mailto:care@grafidu.com">Hubungi Kami</a>
              </li>
            </ul>
          </nav>

          <div className="newsletter">
            <h3 className="col-title">Newsletter</h3>
            <p>
              Tips belajar, mapel baru &amp; set latihan eksklusif &mdash; langsung ke email kamu.
            </p>
            <form className="subscribe" onSubmit={handleSubscribe} noValidate>
              <label className="sr-only" htmlFor="nl-email">
                Alamat email
              </label>
              <input
                id="nl-email"
                type="email"
                name="email"
                placeholder="Tinggalkan email kamu"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" aria-label="Subscribe">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Grafidu &mdash; Cara belajar yang lebih jelas.
          </p>
          <nav className="legal" aria-label="Legal">
            <Link href="/privacy">Kebijakan Privasi</Link>
            <Link href="/terms">Syarat &amp; Ketentuan</Link>
            <Link href="/cookies">Kebijakan Cookie</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
