"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
} from "@/app/actions/admin";
import type { AnnouncementRow } from "@/lib/admin-model";
import { getSessionUser } from "@/lib/auth";
import { relativeWhen } from "@/lib/student-model";

export default function AnnouncementsManager({
  role,
}: {
  role: "student" | "teacher" | "admin";
}) {
  const [items, setItems] = useState<AnnouncementRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  // Pengumuman yang sedang dipilih (diklik). null = belum ada pilihan, jadi
  // yang terbaru (paling atas) yang menyala seperti tampilan awal.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canManage = role === "teacher" || role === "admin";

  const reload = useCallback(async () => {
    try {
      setItems(await listAnnouncements());
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = (items ?? []).filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
  );

  const activeId = filtered.some((a) => a.id === selectedId) ? selectedId : filtered[0]?.id;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!title.trim()) {
      window.gtoast?.("Judul pengumuman wajib diisi.", "error");
      return;
    }
    setBusy(true);
    try {
      const user = await getSessionUser();
      if (!user) {
        window.gtoast?.("Sesi berakhir. Silakan login ulang.", "error");
        return;
      }
      await createAnnouncement(title.trim(), body.trim());
      setTitle("");
      setBody("");
      setShowModal(false);
      window.gtoast?.("Pengumuman berhasil diterbitkan!");
      await reload();
    } catch (err) {
      window.gtoast?.((err as Error).message || "Gagal menerbitkan pengumuman.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await deleteAnnouncement(id);
      window.gtoast?.("Pengumuman telah dihapus.");
      await reload();
    } catch (err) {
      window.gtoast?.((err as Error).message || "Gagal menghapus pengumuman.", "error");
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Papan Pengumuman</h1>
          <p className="page-sub">
            Informasi penting seputar agenda sekolah, jadwal ujian, dan batas pengumpulan tugas.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Buat Pengumuman Baru
          </button>
        )}
      </div>

      <div className="search-row" style={{ marginTop: 22, maxWidth: 640 }}>
        <div className="search-box">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loadError ? (
        <p
          role="alert"
          style={{
            marginTop: 18,
            fontSize: 13.5,
            padding: "10px 14px",
            borderRadius: 10,
            background: "var(--red-soft)",
            color: "#B0504C",
          }}
        >
          Gagal memuat pengumuman: {loadError}.
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {filtered.map((a, i) => {
          const active = a.id === activeId;
          return (
          <div
            key={a.id}
            className="detail-card hover-lift"
            aria-current={active ? "true" : undefined}
            tabIndex={0}
            onClick={() => setSelectedId(a.id)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedId(a.id);
              }
            }}
            style={{
              padding: "20px 24px",
              // Border kiri 4px menggeser isi 3px; padding kiri dikurangi di kartu aktif
              // supaya teks semua kartu tetap lurus.
              paddingLeft: active ? 24 : 27,
              borderLeft: active ? "4px solid var(--purple)" : undefined,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{a.title}</h3>
                  {i === 0 && (
                    <span className="pill pill-green-plain" style={{ fontSize: 11 }}>
                      Terbaru
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12.5, color: "var(--gray-4)", display: "block" }}>
                  {a.creatorName ? `Oleh ${a.creatorName} • ` : ""}
                  {relativeWhen(a.createdAt)}
                </span>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(a.id);
                  }}
                  className="btn-mini btn-mini-danger"
                  style={{ flexShrink: 0 }}
                >
                  Hapus
                </button>
              )}
            </div>

            <p style={{ margin: "12px 0 0", fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65 }}>
              {a.body || "Tidak ada rincian tambahan."}
            </p>
          </div>
          );
        })}

        {filtered.length === 0 && !loadError && (
          <div className="empty-state" style={{ display: "block" }}>
            <span className="es-ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <b>{items === null ? "Memuat pengumuman…" : "Tidak ada pengumuman"}</b>
            <span>
              {items === null
                ? "Mengambil papan pengumuman sekolah."
                : "Tidak ada pengumuman yang cocok dengan pencarianmu."}
            </span>
          </div>
        )}
      </div>

      {/* Modal Dialog for creating announcement */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(24,21,22,0.45)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 14,
              padding: "24px 28px",
              width: "min(480px, 100%)",
              boxShadow: "0 24px 64px rgba(24,21,22,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Terbitkan Pengumuman</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-3)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="field-d" style={{ marginTop: 0 }}>
                <label htmlFor="ann-title">Judul Pengumuman</label>
                <div className="control">
                  <input
                    id="ann-title"
                    type="text"
                    placeholder="Contoh: Jadwal Remedial Bahasa Indonesia"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: "100%", height: 42, padding: "0 14px", borderRadius: 8 }}
                  />
                </div>
              </div>

              <div className="field-d">
                <label htmlFor="ann-body">Rincian Pengumuman</label>
                <div className="control">
                  <textarea
                    id="ann-body"
                    rows={4}
                    placeholder="Tuliskan detail pengumuman, tanggal pelaksanaan, dan petunjuk untuk siswa..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowModal(false)}
                  disabled={busy}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                >
                  {busy ? "Menerbitkan…" : "Terbitkan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}