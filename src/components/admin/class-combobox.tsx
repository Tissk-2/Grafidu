"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Option = { id: string; name: string };

/** Posisi panel dalam koordinat viewport (CSS position: fixed). */
type PanelPos = { left: number; top: number; width: number; bottom: number | null };

const GAP = 6;

/**
 * Custom select dengan kotak pencarian di dalam panel — dipakai untuk memilih
 * kelas pada form akun. Trigger menampilkan pilihan aktif; panel berisi input
 * pencarian + daftar opsi yang tersaring. Navigasi keyboard: panah, Enter,
 * Escape; klik di luar menutup panel.
 *
 * Panel di-render lewat portal ke <dialog> pembuka (fallback document.body),
 * jadi benar-benar keluar dari flow form: tidak mendorong field lain, tidak
 * bisa terpotong overflow field/dialog, dan tetap di atas backdrop karena
 * ikut masuk top-layer <dialog>. Posisi dihitung dari getBoundingClientRect
 * trigger lalu reposition saat scroll/resize; kalau ruang di bawah tidak cukup
 * dan di atas lebih lega, panel flip ke atas.
 */
export default function ClassCombobox({
  id,
  value,
  options,
  onChange,
  placeholder = "Pilih kelas…",
  invalid = false,
}: {
  id: string;
  value: string;
  options: Option[];
  onChange: (classId: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  // createPortal tidak bisa jalan di server → tunggu mount sebelum portal.
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((o) => o.name.toLowerCase().includes(needle))
    : options;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlight(0);
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  /** Hitung ulang posisi panel mengikuti trigger (viewport coords). */
  const place = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const panelHeight = panelRef.current?.offsetHeight ?? 240;
    const below = window.innerHeight - rect.bottom - GAP;
    const above = rect.top - GAP;
    const flip = below < panelHeight && above > below;
    setPos({
      left: rect.left,
      width: rect.width,
      top: flip ? 0 : rect.bottom + GAP,
      bottom: flip ? window.innerHeight - rect.top + GAP : null,
    });
  }, []);

  // useLayoutEffect: posisi terpasang sebelum browser paint → panel tidak berkedip
  // di pojok atau semanticsama jelas #eee dengan isi form.
  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place, filtered.length]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      // Panel ada di portal, jadi harus dicek terpisah dari trigger.
      const inTrigger = rootRef.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  function pick(opt: Option) {
    onChange(opt.id);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") setOpen(false);
  }

  function onSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) pick(opt);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const panel =
    open && mounted && pos ? (
      <div
        ref={panelRef}
        className="adm-combo-panel"
        style={{
          left: pos.left,
          top: pos.top,
          width: pos.width,
          // flip ke atas: pakai `bottom`, bukan `top`.
          ...(pos.bottom !== null ? { bottom: pos.bottom } : {}),
        }}
      >
        <input
          ref={searchRef}
          type="text"
          role="combobox"
          aria-expanded={true}
          aria-controls={`${id}-list`}
          placeholder="Cari kelas…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
          }}
          onKeyDown={onSearchKeyDown}
        />
        <div className="adm-combo-list" role="listbox" id={`${id}-list`} aria-label="Daftar kelas">
          {filtered.length === 0 ? (
            <p className="adm-combo-empty">Kelas tidak ditemukan.</p>
          ) : (
            filtered.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={o.id === value}
                className={"adm-combo-opt" + (i === highlight ? " hi" : "") + (o.id === value ? " on" : "")}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(o)}
              >
                {o.name}
                {o.id === value ? <span aria-hidden="true">✓</span> : null}
              </button>
            ))
          )}
        </div>
      </div>
    ) : null;

  // Portal ke <dialog> pembuka supaya ikut top-layer (tidak tertutup backdrop).
  const portalTarget =
    (mounted && rootRef.current?.closest("dialog")) || (typeof document !== "undefined" ? document.body : null);

  return (
    <>
      <div className={"adm-combo" + (open ? " open" : "")} ref={rootRef}>
        <button
          type="button"
          id={id}
          // `invalid` jadi class, bukan aria-invalid: role button tidak mendukung
          // aria-invalid (jsx-a11y) dan border merahnya yang bikin jelas.
          className={"adm-combo-trigger" + (invalid ? " is-invalid" : "")}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          <span className={"val" + (selected ? "" : " placeholder")}>
            {selected ? selected.name : placeholder}
          </span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {panel && portalTarget ? createPortal(panel, portalTarget) : null}
    </>
  );
}