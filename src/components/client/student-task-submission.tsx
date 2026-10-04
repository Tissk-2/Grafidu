"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { submitTask } from "@/app/actions/student";

export type StudentSubmissionProps = {
  taskId: string;
  isSubmitted: boolean;
  submittedAtStr?: string;
  grade?: number | null;
  feedback?: string | null;
  /** Lampiran yang sudah tersimpan (saat submit ulang, dipakai lagi bila tak diganti). */
  attachmentUrl?: string | null;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB — sama dengan /api/upload/submission
const ALLOWED_EXT = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "jpg", "jpeg", "png", "webp", "gif", "txt", "zip",
];

function extOf(name: string): string {
  return (name.split(".").pop() ?? "").toLowerCase();
}

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function fileLabel(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

export default function StudentTaskSubmission({
  taskId,
  isSubmitted,
  submittedAtStr,
  grade,
  feedback,
  attachmentUrl: initialAttachment,
}: StudentSubmissionProps) {
  const [answer, setAnswer] = useState("");
  const [isEditing, setIsEditing] = useState(!isSubmitted);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmitted);
  // Lampiran yang tersimpan di server untuk tugas ini.
  const [savedAttachment, setSavedAttachment] = useState<string | null>(initialAttachment ?? null);
  // Berkas baru yang dipilih tapi belum diunggah.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) {
      setPendingFile(null);
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      window.gtoast?.("Ukuran berkas maksimal 10 MB.", "error");
      return;
    }
    if (!ALLOWED_EXT.includes(extOf(f.name))) {
      window.gtoast?.(
        "Format tidak didukung. Gunakan PDF, Word, PPT, Excel, gambar, TXT, atau ZIP.",
        "error",
      );
      return;
    }
    setPendingFile(f);
  }

  async function uploadFile(file: File): Promise<string | null> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload/submission", { method: "POST", body });
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !data?.url) {
      throw new Error(data?.error ?? "Gagal mengunggah berkas.");
    }
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!answer.trim() && !pendingFile && !submitted) {
      window.gtoast?.("Tuliskan jawaban atau lampirkan berkas tugas kamu.", "error");
      return;
    }
    setSaving(true);
    try {
      // Berkas diunggah dulu; URL-nya yang disimpan ke database.
      const uploadedUrl = pendingFile ? await uploadFile(pendingFile) : null;
      await submitTask(taskId, answer.trim(), uploadedUrl ?? savedAttachment);
      setSubmitted(true);
      setIsEditing(false);
      setAnswer("");
      if (uploadedUrl) setSavedAttachment(uploadedUrl);
      setPendingFile(null);
      window.gtoast?.("Tugas berhasil dikumpulkan ke gurumu!");
    } catch (err) {
      window.gtoast?.((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="detail-card" style={{ marginTop: 24 }}>
      <div className="sec-row" style={{ margin: "0 0 16px" }}>
        <h3>Pengumpulan Tugas</h3>
        {grade != null ? (
          <span className="pill pill-green" style={{ fontSize: 13, padding: "4px 12px" }}>
            Nilai: {grade} / 100
          </span>
        ) : submitted ? (
          <span className="pill pill-green-plain" style={{ fontSize: 13, padding: "4px 12px" }}>
            Sudah Dikumpulkan — Menunggu Penilaian
          </span>
        ) : (
          <span className="pill pill-red" style={{ fontSize: 13, padding: "4px 12px" }}>
            Belum Dikumpulkan
          </span>
        )}
      </div>

      {grade != null && (
        <div
          className="grade-note"
          style={{
            margin: "0 0 20px 0",
            background: "var(--purple-soft)",
            borderLeft: "3px solid var(--purple)",
            padding: "14px 18px",
            borderRadius: 8,
          }}
        >
          <b style={{ display: "block", fontSize: 14, color: "var(--purple)", marginBottom: 4 }}>
            Catatan dari Guru:
          </b>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            {feedback || "Tugas sudah diperiksa dan dinilai dengan baik."}
          </p>
        </div>
      )}

      {submitted && !isEditing ? (
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--green-soft)",
                color: "#2F9E5B",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <b style={{ fontSize: 14.5 }}>Tugas Telah Dikumpulkan</b>
              <span style={{ display: "block", fontSize: 12.5, color: "var(--gray-4)" }}>
                {submittedAtStr ? `Diserahkan pada ${submittedAtStr}` : "Status: Menunggu penilaian"}
              </span>
            </div>
          </div>

          {savedAttachment ? (
            <a
              href={savedAttachment}
              target="_blank"
              rel="noreferrer"
              className="task-material-link"
              style={{ marginTop: 4 }}
            >
              <Paperclip size={14} aria-hidden />
              Berkas terlampir: {fileLabel(savedAttachment)}
            </a>
          ) : null}

          {grade == null && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => setIsEditing(true)}
            >
              Kirim Ulang / Perbarui Tugas
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="field-d" style={{ marginTop: 0 }}>
            <label htmlFor="task-answer">
              Tulis Jawaban, Catatan, atau Tautan Google Drive:
            </label>
            <div className="control">
              <textarea
                id="task-answer"
                rows={5}
                placeholder="Ketik jawaban kamu di sini atau cantumkan tautan dokumen tugas..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10 }}
              />
            </div>
          </div>

          {/* Lampiran berkas (#3) — input asli disembunyikan, label jadi tombol. */}
          <div className="field-d">
            <label htmlFor="task-file">Lampirkan Berkas (opsional)</label>
            <input
              ref={fileInputRef}
              id="task-file"
              type="file"
              accept={ALLOWED_EXT.map((e) => `.${e}`).join(",")}
              style={{ display: "none" }}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {pendingFile ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--purple)",
                  background: "var(--purple-soft)",
                  fontSize: 13.5,
                }}
              >
                <Paperclip size={15} style={{ color: "var(--purple)", flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {pendingFile.name}
                </span>
                <span style={{ color: "var(--gray-4)", flexShrink: 0 }}>{fmtSize(pendingFile.size)}</span>
                <button
                  type="button"
                  aria-label="Hapus berkas terpilih"
                  onClick={() => {
                    setPendingFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{ display: "grid", placeItems: "center", color: "var(--gray-4)" }}
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} aria-hidden />
                Pilih Berkas
              </button>
            )}
            <p className="hint">
              Format PDF, Word, PPT, Excel, gambar, TXT, atau ZIP — maksimal 10 MB.
              Pastikan format tugas sesuai petunjuk di deskripsi.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Mengirim..." : submitted ? "Simpan Pembaruan" : "Kumpulkan Tugas Sekarang"}
            </button>
            {submitted && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setIsEditing(false);
                  setPendingFile(null);
                  setAnswer("");
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
