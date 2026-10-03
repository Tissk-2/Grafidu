"use client";

import { useState } from "react";
import { submitTask } from "@/app/actions/student";

export type StudentSubmissionProps = {
  taskId: string;
  isSubmitted: boolean;
  submittedAtStr?: string;
  grade?: number | null;
  feedback?: string | null;
};

export default function StudentTaskSubmission({
  taskId,
  isSubmitted,
  submittedAtStr,
  grade,
  feedback,
}: StudentSubmissionProps) {
  const [answer, setAnswer] = useState("");
  const [isEditing, setIsEditing] = useState(!isSubmitted);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmitted);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (!answer.trim() && !submitted) {
      window.gtoast?.("Tuliskan jawaban atau tautan berkas tugas kamu.", "error");
      return;
    }
    setSaving(true);
    try {
      await submitTask(taskId);
      setSubmitted(true);
      setIsEditing(false);
      setAnswer("");
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
            Sudah Dikumpulkan
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
        <div style={{ background: "#F9FAFB", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
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
              Tulis Jawaban, Catatan, atau Tautan Google Drive / Berkas:
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
            <p className="hint">
              Pastikan format tugas sesuai petunjuk di deskripsi (misal format PDF atau DOCX).
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
                onClick={() => setIsEditing(false)}
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
