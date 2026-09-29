"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { update, useDB } from "@/lib/store";

/**
 * Lists every class with student/teaching counts and creates new classes.
 * Duplicate names are rejected (case-insensitive); the error is surfaced inline.
 * Frontend-only: reads and writes the in-browser store.
 */
export default function ClassManager() {
  const db = useDB();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const classes = (db?.classes ?? [])
    .map((c) => ({
      id: c.id,
      name: c.name,
      studentCount: db!.enrollments.filter((e) => e.classId === c.id).length,
      teachingCount: db!.teachings.filter((t) => t.classId === c.id).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = update((d) => {
        const duplicate = d.classes.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
        if (duplicate) throw new Error("Nama kelas sudah dipakai.");
        const cls = { id: d.nextId++, name: name.trim() };
        d.classes.push(cls);
        return cls;
      });
      setNotice(`Kelas ${created.name} berhasil dibuat.`);
      setName("");
      inputRef.current?.focus();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="adm-card" style={{ marginTop: 22 }}>
        <h2>Buat Kelas Baru</h2>
        <p className="sub">Satu kelas mewakili satu rombongan belajar. Nama kelas harus unik.</p>
        <form onSubmit={handleCreate} noValidate style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap", marginTop: 14 }}>
          <div className="field-d" style={{ marginTop: 0, flex: "1 1 260px" }}>
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
            {error ? (
              <span className="adm-inline-error" role="alert">
                {error}
              </span>
            ) : null}
          </div>
          <button type="submit" className={"btn btn-primary btn-sm" + (busy ? " is-loading" : "")} disabled={busy} style={{ marginTop: 0, height: 42 }}>
            Buat Kelas
          </button>
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
