"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClass, listClassesDetailed } from "@/app/actions/admin";
import type { ClassSummary } from "@/lib/admin-model";
import AdminSkeleton from "@/components/admin/admin-skeleton";

/**
 * Lists every class with student/teaching counts and creates new classes.
 * Duplicate names are rejected (unique constraint in the database); the error
 * is surfaced inline. Reads and writes go straight to Supabase.
 */
export default function ClassManager() {
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    try {
      setClasses(await listClassesDetailed());
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createClass(name.trim());
      setNotice(`Kelas ${created.name} berhasil dibuat.`);
      setName("");
      inputRef.current?.focus();
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!classes) {
    return loadError ? (
      <p
        role="alert"
        style={{
          marginTop: 22,
          fontSize: 13.5,
          padding: "10px 14px",
          borderRadius: 10,
          background: "var(--red-soft)",
          color: "#B0504C",
        }}
      >
        Gagal memuat kelas: {loadError}.
      </p>
    ) : (
      <AdminSkeleton />
    );
  }

  return (
    <>
      <div className="adm-card" style={{ marginTop: 22 }}>
        <h2>Buat Kelas Baru</h2>
        <p className="sub">Satu kelas mewakili satu rombongan belajar. Nama kelas harus unik.</p>
        <form onSubmit={handleCreate} noValidate className="adm-create-form">
          <div className="field-d">
            <label htmlFor="new-class-name">Nama kelas</label>
            <div className="control">
              <input
                id="new-class-name"
                ref={inputRef}
                type="text"
                placeholder="Contoh: XI RPL D"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                aria-invalid={error ? true : undefined}
              />
            </div>
          </div>
          <button type="submit" className={"btn btn-primary btn-sm" + (busy ? " is-loading" : "")} disabled={busy}>
            Buat Kelas
          </button>
          {error ? (
            <span className="adm-inline-error adm-create-error" role="alert">
              {error}
            </span>
          ) : null}
        </form>
        {notice ? (
          <p role="status" style={{ marginTop: 12, fontSize: 13.5, color: "#2F7D42" }}>
            {notice}
          </p>
        ) : null}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Kelas</th>
              <th scope="col">Siswa</th>
              <th scope="col">Penugasan mengajar</th>
              <th scope="col" style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td className="cell-main">
                  <b>{c.name}</b>
                </td>
                <td>{c.studentCount}</td>
                <td>{c.teachingCount}</td>
                <td>
                  <div className="actions">
                    <Link className="btn-mini btn-mini-purple" href={`/admin/classes/${c.id}`}>
                      Kelola detail
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {classes.length === 0 ? (
          <div className="adm-empty">
            <span className="ic" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 10 12 5 2 10l10 5 10-5z" />
              </svg>
            </span>
            <b>Belum ada kelas</b>
            <p>Buat kelas pertama, lalu daftarkan siswa dan guru pengampu.</p>
          </div>
        ) : null}
      </div>
    </>
  );
}