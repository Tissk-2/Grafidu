"use client";

import { useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { update, useDB } from "@/lib/store";

export default function AnnouncementsManager({
  role,
}: {
  role: "student" | "teacher" | "admin";
}) {
  const db = useDB();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const user = getCurrentUser();
  const canManage = role === "teacher" || role === "admin";

  const list = [...(db?.announcements ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((a) => {
      const creator = a.createdBy ? db?.users.find((u) => u.id === a.createdBy) : null;
      return {
        id: a.id,
        title: a.title,
        body: a.body,
        createdLabel: a.createdLabel,
        creator: creator ? { name: creator.name, role: creator.role } : null,
      };
    });

  const filtered = list.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      window.gtoast?.("Judul pengumuman wajib diisi.", "error");
      return;
    }
    update((d) => {
      // Store users have numeric ids; a Supabase session id (UUID) never
      // matches one, so no creator label is shown in that case.
      const numericId = Number(user?.id);
      d.announcements.push({
        id: d.nextId++,
        title: title.trim(),
        body: body.trim(),
        createdBy: user && Number.isFinite(numericId) ? numericId : null,
        createdLabel: "Baru saja",
        createdAt: new Date().toISOString(),
      });
    });
    setTitle("");
    setBody("");
    setShowModal(false);
    window.gtoast?.("Pengumuman berhasil diterbitkan!");
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus pengumuman ini?")) return;
    update((d) => {
      d.announcements = d.announcements.filter((a) => a.id !== id);
    });
    window.gtoast?.("Pengumuman telah dihapus.");
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

      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {filtered.map((a, i) => (
          <div
            key={a.id}
            className="detail-card hover-lift"
            style={{
              padding: "20px 24px",
              borderLeft: i === 0 ? "4px solid var(--purple)" : undefined,
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
                  {a.creator?.name ? `Oleh ${a.creator.name} • ` : ""}
                  {a.createdLabel || "Pengumuman Sekolah"}
                </span>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
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
        ))}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ display: "block" }}>
            <span className="es-ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <b>Tidak ada pengumuman</b>
            <span>Tidak ada pengumuman yang cocok dengan pencarianmu.</span>
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
              background: "#fff",
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
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Terbitkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
