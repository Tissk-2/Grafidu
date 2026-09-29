"use client";

import { useEffect, useState } from "react";

export type ClassOption = { id: number; name: string };

export type AccountFormValues = {
  role: "student" | "teacher";
  name: string;
  email: string;
  phone: string;
  classId: string;
  subject: string;
};

export const emptyAccountValues: AccountFormValues = {
  role: "student",
  name: "",
  email: "",
  phone: "",
  classId: "",
  subject: "",
};

/**
 * Labeled, keyboard-operable account form shared by the create and edit
 * dialogs. Validation errors are shown inline per field.
 */
export default function AccountForm({
  mode,
  values,
  onChange,
  classes,
  busy,
  serverError,
  onSubmit,
  submitLabel,
  formId,
  onCancel,
}: {
  mode: "create" | "edit";
  values: AccountFormValues;
  onChange: (next: AccountFormValues) => void;
  classes: ClassOption[];
  busy: boolean;
  serverError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  formId: string;
  onCancel?: () => void;
}) {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AccountFormValues, string>>>({});

  useEffect(() => {
    setFieldErrors({});
  }, [mode, values.role]);

  function set<K extends keyof AccountFormValues>(key: K, value: AccountFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof AccountFormValues, string>> = {};
    if (!values.name.trim()) errors.name = "Nama lengkap wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Format email tidak valid.";
    if (mode === "create" && values.role === "student" && !values.classId) {
      errors.classId = "Pilih kelas untuk siswa.";
    }
    if (mode === "create" && values.role === "teacher" && !values.subject.trim()) {
      errors.subject = "Mapel utama wajib diisi.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(e);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate>
      {mode === "create" ? (
        <div className="field-d" style={{ marginTop: 0 }}>
          <label htmlFor={`${formId}-role`}>Peran Akun</label>
          <div className="control">
            <select
              id={`${formId}-role`}
              value={values.role}
              onChange={(e) => set("role", e.target.value as "student" | "teacher")}
            >
              <option value="student">Siswa</option>
              <option value="teacher">Guru</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="field-d">
        <label htmlFor={`${formId}-name`}>Nama lengkap</label>
        <div className="control">
          <input
            id={`${formId}-name`}
            type="text"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={120}
            required
            aria-invalid={fieldErrors.name ? true : undefined}
          />
        </div>
        {fieldErrors.name ? <span className="adm-inline-error">{fieldErrors.name}</span> : null}
      </div>

      <div className="field-d">
        <label htmlFor={`${formId}-email`}>Email</label>
        <div className="control">
          <input
            id={`${formId}-email`}
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            maxLength={254}
            required
            aria-invalid={fieldErrors.email ? true : undefined}
          />
        </div>
        {fieldErrors.email ? <span className="adm-inline-error">{fieldErrors.email}</span> : null}
      </div>

      <div className="field-d">
        <label htmlFor={`${formId}-phone`}>Nomor telepon (opsional)</label>
        <div className="control">
          <input
            id={`${formId}-phone`}
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            maxLength={30}
          />
        </div>
      </div>

      {mode === "create" && values.role === "student" ? (
        <div className="field-d">
          <label htmlFor={`${formId}-class`}>Kelas</label>
          <div className="control">
            <select
              id={`${formId}-class`}
              value={values.classId}
              onChange={(e) => set("classId", e.target.value)}
              required
              aria-invalid={fieldErrors.classId ? true : undefined}
            >
              <option value="">Pilih kelas…</option>
              {classes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {fieldErrors.classId ? <span className="adm-inline-error">{fieldErrors.classId}</span> : null}
        </div>
      ) : null}

      {mode === "edit" && values.role === "teacher" ? (
        <div className="field-d">
          <label htmlFor={`${formId}-subject`}>Mapel utama</label>
          <div className="control">
            <input
              id={`${formId}-subject`}
              type="text"
              value={values.subject}
              onChange={(e) => set("subject", e.target.value)}
              maxLength={100}
            />
          </div>
        </div>
      ) : null}

      {mode === "create" && values.role === "teacher" ? (
        <div className="field-d">
          <label htmlFor={`${formId}-subject-new`}>Mapel utama</label>
          <div className="control">
            <input
              id={`${formId}-subject-new`}
              type="text"
              value={values.subject}
              onChange={(e) => set("subject", e.target.value)}
              maxLength={100}
              required
              aria-invalid={fieldErrors.subject ? true : undefined}
            />
          </div>
          {fieldErrors.subject ? <span className="adm-inline-error">{fieldErrors.subject}</span> : null}
          <p className="adm-form-note">
            Penugasan guru ke kelas tertentu dikelola di halaman detail kelas.
          </p>
        </div>
      ) : null}

      {serverError ? (
        <span className="adm-inline-error" role="alert">
          {serverError}
        </span>
      ) : null}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        {onCancel ? (
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>
            Batal
          </button>
        ) : null}
        <button type="submit" className={"btn btn-primary btn-sm" + (busy ? " is-loading" : "")} disabled={busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
