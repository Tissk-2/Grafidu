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
              A clearer way to learn &mdash; know where you are, know what to do next.
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

          <nav className="col" aria-label="Students">
            <h3 className="col-title">Students</h3>
            <ul className="link-list">
              <li>
                <a href="#platform">All Subjects</a>
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
                <a href="#ai">Practice Sets</a>
              </li>
            </ul>
          </nav>

          <nav className="col" aria-label="Platform">
            <h3 className="col-title">Platform</h3>
            <ul className="link-list">
              <li>
                <a href="#students">For Students</a>
              </li>
              <li>
                <a href="#teachers">For Teachers</a>
              </li>
              <li>
                <a href="#ai">AI Agent</a>
              </li>
              <li>
                <a href="#students">Grades &amp; Insights</a>
              </li>
              <li>
                <Link href="/signup">Join Us</Link>
              </li>
              <li>
                <a href="mailto:care@grafidu.com?subject=Media%20Enquiry">Media Enquiry</a>
              </li>
            </ul>
          </nav>

          <nav className="col" aria-label="Care and service">
            <h3 className="col-title">Care &amp; Service</h3>
            <ul className="link-list">
              <li>
                <Link href="/faqs">FAQs</Link>
              </li>
              <li>
                <a href="#platform">Getting Started</a>
              </li>
              <li>
                <Link href="/signup">Where&rsquo;s My Invite</Link>
              </li>
              <li>
                <a href="mailto:care@grafidu.com">Talk To Us</a>
              </li>
            </ul>
          </nav>

          <div className="newsletter">
            <h3 className="col-title">The Letter</h3>
            <p>
              Study tips, fresh subjects &amp; members-only practice sets &mdash; straight to your
              inbox.
            </p>
            <form className="subscribe" onSubmit={handleSubscribe} noValidate>
              <label className="sr-only" htmlFor="nl-email">
                Email address
              </label>
              <input
                id="nl-email"
                type="email"
                name="email"
                placeholder="Leave your email"
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
            &copy; {new Date().getFullYear()} Grafidu &mdash; A clearer way to learn.
          </p>
          <div className="socials">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.93.26-1.56 1.6-1.56h1.7V4.3c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.13 1.5-4.13 4.24v2.4H7.5V14h2.7v8h3.3Z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M22 5.9c-.74.33-1.53.55-2.36.65.85-.51 1.5-1.32 1.8-2.28-.79.47-1.67.81-2.6 1A4.1 4.1 0 0 0 11.8 9c0 .32.03.63.1.93A11.65 11.65 0 0 1 3.4 5.64a4.1 4.1 0 0 0 1.27 5.48c-.67-.02-1.3-.2-1.86-.5v.05c0 1.99 1.41 3.65 3.29 4.02-.34.1-.71.14-1.08.14-.27 0-.52-.02-.78-.07.52 1.63 2.04 2.82 3.83 2.85A8.23 8.23 0 0 1 2 19.54 11.6 11.6 0 0 0 8.29 21.4c7.55 0 11.67-6.25 11.67-11.67v-.53c.8-.58 1.5-1.3 2.04-2.12Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                fillRule="evenodd"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 8.4A3.6 3.6 0 1 0 12 15.6 3.6 3.6 0 0 0 12 8.4Zm0 5.93a2.33 2.33 0 1 1 0-4.66 2.33 2.33 0 0 1 0 4.66ZM16.9 8.2a.84.84 0 1 1-1.68 0 .84.84 0 0 1 1.68 0ZM12 4.8c1.98 0 2.21.01 2.99.04.72.03 1.11.15 1.37.25.34.13.59.29.85.55.26.26.42.5.55.85.1.26.22.65.25 1.37.03.78.04 1.01.04 2.99s-.01 2.21-.04 2.99c-.03.72-.15 1.11-.25 1.37-.13.34-.29.59-.55.85-.26.26-.5.42-.85.55-.26.1-.65.22-1.37.25-.78.03-1.01.04-2.99.04s-2.21-.01-2.99-.04c-.72-.03-1.11-.15-1.37-.25a2.3 2.3 0 0 1-.85-.55 2.3 2.3 0 0 1-.55-.85c-.1-.26-.22-.65-.25-1.37-.03-.78-.04-1.01-.04-2.99s.01-2.21.04-2.99c.03-.72.15-1.11.25-1.37.13-.34.29-.59.55-.85.26-.26.5-.42.85-.55.26-.1.65-.22 1.37-.25C8.64 4.81 8.87 4.8 12 4.8M12 3c-2.01 0-2.26.01-3.05.04-.79.04-1.33.16-1.8.35-.49.19-.9.44-1.31.85-.41.41-.66.82-.85 1.31-.19.47-.31 1.01-.35 1.8-.03.79-.04 1.04-.04 3.05v5.2c0 2.01.01 2.26.04 3.05.04.79.16 1.33.35 1.8.19.49.44.9.85 1.31.41.41.82.66 1.31.85.47.19 1.01.31 1.8.35.79.03 1.04.04 3.05.04s2.26-.01 3.05-.04c.79-.04 1.33-.16 1.8-.35.49-.19.9-.44 1.31-.85.41-.41.66-.82.85-1.31.19-.47.31-1.01.35-1.8.03-.79.04-1.04.04-3.05V9.4c0-2.01-.01-2.26-.04-3.05-.04-.79-.16-1.33-.35-1.8a3.63 3.63 0 0 0-.85-1.31 3.63 3.63 0 0 0-1.31-.85c-.47-.19-1.01-.31-1.8-.35C14.26 3.01 14.01 3 12 3Z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M6.94 8.5H3.56V20.4h3.38V8.5ZM5.25 3.6a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.4 13.3c0-3.16-1.69-4.63-3.94-4.63-1.82 0-2.63 1-3.09 1.7V8.5H10v11.9h3.37v-6.64c0-.27.02-.54.1-.73.22-.54.71-1.1 1.55-1.1 1.09 0 1.53.83 1.53 2.05v6.42H20.4V13.3Z" />
              </svg>
            </a>
          </div>
          <nav className="legal" aria-label="Legal">
            <Link href="/privacy">Privacy Notice</Link>
            <Link href="/terms">Terms &amp; Policies</Link>
            <Link href="/cookies">Cookie Notice</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
