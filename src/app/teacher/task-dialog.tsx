"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type TaskFormValue = {
  title: string;
  dueDate: string; // yyyy-mm-dd untuk <input type="date">
  description: string;
  materialId: string; // "" = tanpa lampiran materi
};

/**
 * Dialog buat/edit tugas guru. Props-driven seperti materi-form-dialog,
 * memakai style .gdialog yang sama. dueDate dikonversi ke ISO oleh pemanggil.
 * Mata pelajaran tidak diminta di sini — sudah terikat pada amanah guru
 * (teachings); yang bisa dipilih adalah materi (Lampiran) dari halaman Materi.
 */
export default function TaskDialog({
  open,
  initial,
  kelasLabel,
  materials,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initial?: TaskFormValue;
  kelasLabel: string;
  materials: { id: string; title: string }[];
  onClose: () => void;
  onSubmit: (value: TaskFormValue) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState<TaskFormValue>({
    title: "",
    dueDate: "",
    description: "",
    materialId: "",
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      setValue(
        initial ?? {
          title: "",
          dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
          description: "",
          materialId: "",
        },
      );
      if (typeof el.showModal === "function") el.showModal();
      else el.setAttribute("open", "");
    } else if (el.open) {
      el.close();
    }
  }, [open, initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.title.trim();
    if (!title || !value.dueDate) return;
    onSubmit({ ...value, title });
  }

  return (
    <dialog
      className="gdialog"
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="gdialog-head">
        <div>
          <h3>{initial ? "Edit Tugas" : "Buat Tugas Baru"}</h3>
          <p>Tugas untuk {kelasLabel} — siswa mengumpulkan lewat halaman Tasks mereka.</p>
        </div>
        <button className="gdialog-close" aria-label="Tutup" onClick={() => ref.current?.close()}>
          <X size={14} aria-hidden />
        </button>
      </div>
      <form className="gdialog-body" style={{ paddingBottom: 0 }} onSubmit={submit}>
        <div className="field-d">
          <label htmlFor="task-title">Judul Tugas</label>
          <div className="control">
            <input
              id="task-title"
              type="text"
              placeholder="Contoh: Menulis Teks Eksposisi"
              value={value.title}
              onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="f2">
          <div className="field-d">
            <label htmlFor="task-material">Lampiran (materi)</label>
            <div className="control">
              <select
                id="task-material"
                value={value.materialId}
                onChange={(e) => setValue((v) => ({ ...v, materialId: e.target.value }))}
              >
                <option value="">Tanpa lampiran</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-d">
            <label htmlFor="task-due">Tenggat</label>
            <div className="control">
              <input
                id="task-due"
                type="date"
                value={value.dueDate}
                onChange={(e) => setValue((v) => ({ ...v, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>
        <div className="field-d">
          <label htmlFor="task-desc">Deskripsi</label>
          <div className="control">
            <textarea
              id="task-desc"
              placeholder="Instruksi tugas, format pengumpulan, dan kriteria penilaian..."
              value={value.description}
              onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
            />
          </div>
        </div>
        <div className="gdialog-foot">
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={() => ref.current?.close()}
          >
            Batal
          </button>
          <button className="btn btn-primary btn-sm" type="submit">
            {initial ? "Simpan Perubahan" : "Buat Tugas"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
