"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type MateriFormValue = { title: string; desc: string; files: string };

const EMPTY: MateriFormValue = { title: "", desc: "", files: "" };

/**
 * "Bagikan Materi" dialog for /teacher/materi. Props-driven (open/initial),
 * unlike the legacy store-backed dialogs. Reuses the `.gdialog` styles.
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
  const [value, setValue] = useState<MateriFormValue>(EMPTY);

  // Re-seed the form each time the dialog opens (create = blank, edit = initial).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      setValue(initial ?? EMPTY);
      if (typeof el.showModal === "function") el.showModal();
      else el.setAttribute("open", "");
    } else if (el.open) {
      el.close();
    }
  }, [open, initial]);

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
          <label htmlFor="materi-files">Lampiran</label>
          <div className="control">
            <input
              id="materi-files"
              type="text"
              placeholder="URL atau nama file, pisahkan dengan koma"
              value={value.files}
              onChange={(e) => setValue((v) => ({ ...v, files: e.target.value }))}
            />
          </div>
          <p className="hint">Materi dibagikan ke {kelasLabel}.</p>
        </div>
        <div className="gdialog-foot">
          <button className="btn btn-outline btn-sm" type="button" onClick={() => ref.current?.close()}>
            Batal
          </button>
          <button className="btn btn-primary btn-sm" type="submit">
            {initial ? "Simpan Perubahan" : "Bagikan"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
