"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { update, useDB } from "@/lib/store";
import AdminSkeleton from "@/components/admin/admin-skeleton";

/**
 * Manages one class: rename (syncs legacy class names), move students in
 * (with an explicit old → new confirmation), and manage teacher/subject
 * assignments. Frontend-only: everything derives from the in-browser store,
 * so counts stay honest after every mutation.
 */
export default function ClassDetailManager({ classId }: { classId: number }) {
  const db = useDB();
  const clsFound = db?.classes.find((c) => c.id === classId) ?? null;

  const [newName, setNewName] = useState(clsFound?.name ?? "");
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState("");
  const [moveBusy, setMoveBusy] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  const [teacherId, setTeacherId] = useState("");
  const [subject, setSubject] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  // The store fills in after mount, so keep the input in sync once the class
  // is known (and after a successful rename saves a new name).
  const loadedId = clsFound?.id ?? null;
  const loadedName = clsFound?.name ?? null;
  useEffect(() => {
    if (loadedId !== null && loadedName !== null) setNewName(loadedName);
  }, [loadedId, loadedName]);

  // The store fills in after mount. The admin shell lives in the route layout,
  // so showing a skeleton here only affects the main column.
  if (!db) return <AdminSkeleton />;

  if (!clsFound) {
    return (
      <div className="adm-card" style={{ marginTop: 22 }}>
        <div className="adm-empty">
          <b>Kelas tidak ditemukan</b>
          <p>Kelas ini mungkin baru dibuat atau sudah tidak tersedia di sesi ini.</p>
          <Link className="btn btn-primary btn-sm" href="/admin/classes">
            Kembali ke semua kelas
          </Link>
        </div>
      </div>
    );
  }

  const cls = clsFound;

  const students = db.enrollments
    .filter((e) => e.classId === cls.id)
    .map((e) => db.users.find((u) => u.id === e.studentId))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({ id: s.id, name: s.name, email: s.email, isActive: s.isActive !== false }));

  const assignments = db.teachings
    .filter((t) => t.classId === cls.id)
    .map((t) => {
      const teacher = db.users.find((u) => u.id === t.teacherId);
      return {
        teacherId: t.teacherId,
        teacherName: teacher?.name ?? "Guru",
        subject: t.subject,
        isActive: teacher ? teacher.isActive !== false : true,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject) || a.teacherName.localeCompare(b.teacherName));

  const teachers = db.users
    .filter((u) => u.role === "teacher" && u.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((t) => ({ id: t.id, name: t.name, subject: t.subject }));

  const allStudents = db.users
    .filter((u) => u.role === "student")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({ id: s.id, name: s.name, className: s.className }));

  const moveCandidates = allStudents.filter((s) => !students.some((d) => d.id === s.id));

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (renameBusy) return;
    setRenameBusy(true);
    setRenameError(null);
    try {
      const saved = update((d) => {
        const target = d.classes.find((c) => c.id === cls.id);
        if (!target) throw new Error("Kelas tidak ditemukan.");
        if (!newName.trim()) throw new Error("Nama kelas wajib diisi.");
        const duplicate = d.classes.some(
          (c) => c.id !== cls.id && c.name.toLowerCase() === newName.trim().toLowerCase()
        );
        if (duplicate) throw new Error("Nama kelas sudah dipakai.");
        const old = target.name;
        const next = newName.trim();
        if (old !== next) {
          target.name = next;
          // Keep the legacy class-name label on user profiles consistent.
          for (const u of d.users) {
            if (u.className === old) u.className = next;
          }
        }
        return next;
      });
      setNotice({ kind: "ok", text: `Nama kelas diubah menjadi ${saved}. Nama kelas lama pada profil pengguna juga diperbarui.` });
      setLiveMessage(`Nama kelas diubah menjadi ${saved}.`);
    } catch (err) {
      setRenameError((err as Error).message);
      setNotice({ kind: "error", text: (err as Error).message });
    } finally {
      setRenameBusy(false);
    }
  }

  async function handleMove(e: React.FormEvent) {
    e.preventDefault();
    if (moveBusy || !studentId) return;
    const target = allStudents.find((s) => String(s.id) === studentId);
    if (!target) return;
    const fromName = target.className ?? "tanpa kelas";
    const confirmed = confirm(
      `Pindahkan ${target.name} dari kelas ${fromName} ke kelas ${cls.name}? Riwayat nilai dan tugas siswa tetap tersimpan.`
    );
    if (!confirmed) return;
    setMoveBusy(true);
    setMoveError(null);
    try {
      update((d) => {
        d.enrollments = d.enrollments.filter((en) => en.studentId !== target.id);
        d.enrollments.push({ classId: cls.id, studentId: target.id });
        const u = d.users.find((row) => row.id === target.id);
        if (u) u.className = cls.name;
      });
      setNotice({ kind: "ok", text: `${target.name} dipindahkan ke ${cls.name}.` });
      setLiveMessage(`${target.name} dipindahkan ke ${cls.name}.`);
      setStudentId("");
    } catch (err) {
      setMoveError((err as Error).message);
      setNotice({ kind: "error", text: (err as Error).message });
    } finally {
      setMoveBusy(false);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (assignBusy || !teacherId || !subject.trim()) return;
    setAssignBusy(true);
    setAssignError(null);
    try {
      const teacher = teachers.find((t) => String(t.id) === teacherId);
      update((d) => {
        const duplicate = d.teachings.some(
          (t) => t.classId === cls.id && t.teacherId === Number(teacherId) && t.subject === subject.trim()
        );
        if (duplicate) throw new Error("Guru sudah ditugaskan untuk mapel tersebut di kelas ini.");
        d.teachings.push({ classId: cls.id, teacherId: Number(teacherId), subject: subject.trim() });
      });
      setNotice({ kind: "ok", text: `${teacher?.name ?? "Guru"} ditugaskan mengajar ${subject.trim()}.` });
      setLiveMessage(`${teacher?.name ?? "Guru"} ditugaskan mengajar ${subject.trim()}.`);
      setTeacherId("");
      setSubject("");
    } catch (err) {
      setAssignError((err as Error).message);
      setNotice({ kind: "error", text: (err as Error).message });
    } finally {
      setAssignBusy(false);
    }
  }

  async function handleRemove(teacherIdToRemove: number, teacherName: string, subjectToRemove: string) {
    if (!confirm(`Hapus penugasan ${teacherName} untuk mapel ${subjectToRemove} di kelas ini?`)) return;
    try {
      update((d) => {
        d.teachings = d.teachings.filter(
          (t) => !(t.classId === cls.id && t.teacherId === teacherIdToRemove && t.subject === subjectToRemove)
        );
      });
      setNotice({ kind: "ok", text: `Penugasan ${teacherName} (${subjectToRemove}) dihapus.` });
      setLiveMessage(`Penugasan ${teacherName} dihapus.`);
    } catch (err) {
      setNotice({ kind: "error", text: (err as Error).message });
    }
  }

  return (
    <>
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {liveMessage}
      </div>

      {notice ? (
        <p
          role="status"
          style={{
            marginTop: 16,
            fontSize: 13.5,
            padding: "10px 14px",
            borderRadius: 10,
            background: notice.kind === "ok" ? "var(--green-soft)" : "var(--red-soft)",
            color: notice.kind === "ok" ? "#2F7D42" : "#B0504C",
          }}
        >
          {notice.text}
        </p>
      ) : null}

      <div className="adm-card">
        <h2>Nama Kelas</h2>
        <p className="sub">
          Mengubah nama kelas juga memperbarui label kelas pada profil siswa dan guru yang terhubung.
        </p>
        <form onSubmit={handleRename} noValidate style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12 }}>
          <div className="field-d" style={{ marginTop: 0, flex: "1 1 240px" }}>
            <label htmlFor="rename-class">Nama kelas</label>
            <div className="control">
              <input
                id="rename-class"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
                required
                aria-invalid={renameError ? true : undefined}
              />
            </div>
            {renameError ? <span className="adm-inline-error" role="alert">{renameError}</span> : null}
          </div>
          <button type="submit" className={"btn btn-primary btn-sm" + (renameBusy ? " is-loading" : "")} disabled={renameBusy} style={{ height: 42 }}>
            Simpan Nama
          </button>
        </form>
      </div>

      <div className="adm-card">
        <h2>Siswa ({students.length})</h2>
        <p className="sub">Satu siswa memiliki satu kelas aktif. Nilai dan tugas tersimpan saat siswa dipindahkan.</p>
        <form onSubmit={handleMove} className="adm-transfer" noValidate>
          <div className="field-d">
            <label htmlFor="move-student">Pindahkan siswa ke kelas ini</label>
            <select
              id="move-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Pilih siswa…</option>
              {moveCandidates.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} — {s.className ?? "tanpa kelas"}
                </option>
              ))}
            </select>
            {moveError ? <span className="adm-inline-error" role="alert">{moveError}</span> : null}
          </div>
          <button type="submit" className={"btn btn-primary btn-sm" + (moveBusy ? " is-loading" : "")} disabled={moveBusy || !studentId} style={{ height: 42 }}>
            Pindahkan
          </button>
        </form>

        <div className="adm-table-wrap" style={{ marginTop: 16 }}>
          <table className="adm-table" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="cell-main">
                    <b>{s.name}</b>
                  </td>
                  <td>{s.email}</td>
                  <td>
                    <span className={"pill " + (s.isActive ? "pill-green" : "pill-red")}>{s.isActive ? "Aktif" : "Nonaktif"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 ? (
            <div className="adm-empty">
              <b>Belum ada siswa di kelas ini</b>
              <p>Pindahkan siswa dari daftar di atas, atau buat akun siswa baru di halaman Akun.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="adm-card">
        <h2>Guru Pengampu ({assignments.length})</h2>
        <p className="sub">Satu guru dapat mengajar lebih dari satu mapel; kombinasi guru dan mapel harus unik.</p>
        <form onSubmit={handleAssign} className="adm-transfer" noValidate>
          <div className="field-d">
            <label htmlFor="assign-teacher">Guru</label>
            <select id="assign-teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="">Pilih guru aktif…</option>
              {teachers.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                  {t.subject ? ` — ${t.subject}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field-d">
            <label htmlFor="assign-subject">Mata pelajaran</label>
            <input
              id="assign-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Matematika"
              maxLength={100}
            />
          </div>
          <button type="submit" className={"btn btn-primary btn-sm" + (assignBusy ? " is-loading" : "")} disabled={assignBusy || !teacherId || !subject.trim()} style={{ height: 42 }}>
            Tugaskan
          </button>
        </form>
        {assignError ? (
          <span className="adm-inline-error" role="alert">
            {assignError}
          </span>
        ) : null}

        <div className="adm-table-wrap" style={{ marginTop: 16 }}>
          <table className="adm-table" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th scope="col">Guru</th>
                <th scope="col">Mapel</th>
                <th scope="col" style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={`${a.teacherId}-${a.subject}`}>
                  <td className="cell-main">
                    <b>{a.teacherName}</b>
                  </td>
                  <td>{a.subject}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="btn-mini btn-mini-danger"
                        onClick={() => handleRemove(a.teacherId, a.teacherName, a.subject)}
                      >
                        Hapus Penugasan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 ? (
            <div className="adm-empty">
              <b>Belum ada guru pengampu</b>
              <p>Tugaskan guru aktif beserta mapel yang diampu di kelas ini.</p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
