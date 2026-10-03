"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

export type MateriFormValue = { title: string; desc: string; files: string[] };

const EMPTY: MateriFormValue = { title: "", desc: "", files: [] };

/** "/materi/eksposisi-modul.pdf" -> "eksposisi-modul.pdf" untuk label chip. */
export function fileLabel(path: string): string {
  try {
    const url = new URL(path, "https://contoh.id");
    const last = url.pathname.split("/").filter(Boolean).pop();
    return decodeURIComponent(last ?? path);
  } catch {
    return path;
  }
}

/**
 * "Bagikan Materi" dialog for /teacher/materi. Props-driven (open/initial),
 * unlike the legacy store-backed dialogs. Reuses the `.gdialog` styles.
 * Lampiran berupa file dropper: tarik-lepas atau klik untuk memilih berkas;
 * setiap berkas langsung diunggah ke /api/upload/materi.
 */
export default function MateriFormDialog({
  open,
  initial,
  kelasLabel,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: MateriFormValue;
  kelasLabel: string;
  onClose: () => void;
  onSubmit: (value: MateriFormValue) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<MateriFormValue>(EMPTY);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Re-seed the form each time the dialog opens (create = blank, edit = initial).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      setValue(initial ?? EMPTY);
      setUploadError(null);
      if (typeof el.showModal === "function") el.showModal();
      else el.setAttribute("open", "");
    } else if (el.open) {
      el.close();
    }
  }, [open, initial]);

  async function uploadFiles(list: FileList | File[]) {
    const files = Array.from(list);
    if (files.length === 0) return;
    setUploadError(null);
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload/materi", { method: "POST", body });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          setUploadError(json.error ?? "Gagal mengunggah berkas.");
        } else {
          setValue((v) =>
            v.files.includes(json.url!) ? v : { ...v, files: [...v.files, json.url!] },
          );
        }
      } catch {
        setUploadError("Gagal mengunggah berkas. Coba lagi.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function removeFile(path: string) {
    setValue((v) => ({ ...v, files: v.files.filter((f) => f !== path) }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.title.trim();
    if (!title) return;
    onSubmit({ ...value, title });
  }

  return (
    <dialog
      className="gdialog"
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Native <dialog> closes on backdrop click only if we make it so.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="gdialog-head">
        <div>
          <h3>{initial ? "Edit Materi" : "Bagikan Materi Baru"}</h3>
          <p>Materi bisa langsung dipakai siswa dan dijadikan bahan kuis oleh AI.</p>
        </div>
        <button className="gdialog-close" aria-label="Tutup" onClick={() => ref.current?.close()}>
          <X size={14} aria-hidden />
        </button>
      </div>
      <form className="gdialog-body" style={{ paddingBottom: 0 }} onSubmit={submit}>
        <div className="field-d">
          <label htmlFor="materi-title">Judul Materi</label>
          <div className="control">
            <input
              id="materi-title"
              type="text"
              placeholder="Contoh: Teks Eksposisi"
              value={value.title}
              onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="field-d">
          <label htmlFor="materi-desc">Deskripsi</label>
          <div className="control">
            <textarea
              id="materi-desc"
              placeholder="Ringkas apa yang dipelajari siswa dari materi ini..."
              value={value.desc}
              onChange={(e) => setValue((v) => ({ ...v, desc: e.target.value }))}
            />
          </div>
        </div>
        <div className="field-d">
          <label>Lampiran</label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Unggah lampiran"
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void uploadFiles(e.dataTransfer.files);
            }}
            style={{
              border: `1.5px dashed ${dragOver ? "var(--purple)" : "var(--line)"}`,
              borderRadius: 10,
              background: dragOver ? "var(--purple-soft)" : "transparent",
              padding: "22px 16px",
              textAlign: "center",
              cursor: "pointer",
              color: "var(--gray-3)",
              transition: "border-color .15s, background .15s",
            }}
          >
            <UploadCloud size={20} aria-hidden style={{ margin: "0 auto 6px", color: "var(--purple)" }} />
            <b style={{ display: "block", fontSize: 13.5, color: "var(--ink)" }}>
              Tarik-lepas berkas di sini, atau klik untuk memilih
            </b>
            <span style={{ display: "block", fontSize: 12, marginTop: 3 }}>
              PDF, Word, PPT, Excel, gambar, TXT, atau ZIP — maks 10 MB per berkas
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            aria-hidden
            tabIndex={-1}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.gif,.txt,.zip"
            onChange={(e) => {
              if (e.target.files) void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {uploading > 0 ? (
            <p className="hint" role="status">
              Mengunggah {uploading} berkas…
            </p>
          ) : null}
          {uploadError ? (
            <p className="hint" role="alert" style={{ color: "var(--red)" }}>
              {uploadError}
            </p>
          ) : null}

          {value.files.length > 0 ? (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
              {value.files.map((f) => (
                <span
                  key={f}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[var(--purple-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--purple)]"
                  title={f}
                >
                  <FileText size={12} aria-hidden className="shrink-0" />
                  <span className="truncate">{fileLabel(f)}</span>
                  <button
                    type="button"
                    aria-label={`Hapus lampiran ${fileLabel(f)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(f);
                    }}
                    className="ml-0.5 rounded-full p-0.5 transition hover:bg-[var(--purple)] hover:text-white"
                  >
                    <X size={11} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <p className="hint">Materi dibagikan ke {kelasLabel}.</p>
        </div>
        <div className="gdialog-foot">
          <button className="btn btn-outline btn-sm" type="button" onClick={() => ref.current?.close()}>
            Batal
          </button>
          <button className="btn btn-primary btn-sm" type="submit" disabled={uploading > 0}>
            {uploading > 0 ? "Menunggu unggahan…" : initial ? "Simpan Perubahan" : "Bagikan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
