"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  assignTeaching,
  fetchClassDetail,
  moveStudent,
  removeTeaching,
  renameClass,
} from "@/app/actions/admin";
import type { ClassDetailData } from "@/lib/admin-model";
import CustomSelect from "@/components/ui/custom-select";
import AdminSkeleton from "@/components/admin/admin-skeleton";

/**
 * Manages one class: rename (syncs the class label on user profiles), move
 * students in (with an explicit old → new confirmation), and manage
 * teacher/subject assignments. Everything reads and writes Supabase directly,
 * so counts stay honest after every mutation.
 */
export default function ClassDetailManager({ classId }: { classId: string }) {
  const [data, setData] = useState<ClassDetailData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [newName, setNewName] = useState("");
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

  const reload = useCallback(async () => {
    try {
      const next = await fetchClassDetail(classId);
      if (!next) {
        setNotFound(true);
        return;
      }
      setData(next);
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, [classId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Nama kelas diketahui setelah data tiba; sinkronkan input rename.
  const loadedName = data?.cls.name ?? null;
  useEffect(() => {
    if (loadedName !== null) setNewName(loadedName);
  }, [loadedName]);

  if (!data || notFound) {
    if (notFound) {
      return (
        <div className="adm-card" style={{ marginTop: 22 }}>
          <div className="adm-empty">
            <b>Kelas tidak ditemukan</b>
            <p>Kelas ini mungkin sudah dihapus atau tautannya tidak valid.</p>
            <Link className="btn btn-primary btn-sm" href="/admin/classes">
              Kembali ke semua kelas
            </Link>
          </div>
        </div>
      );
    }
    if (loadError) {
      return (
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
      );
    }
    return <AdminSkeleton />;
  }

  const cls = data.cls;
  const students = data.students;
  const assignments = data.assignments;
  const teachers = data.teachers;
  const moveCandidates = data.allStudents.filter((s) => !students.some((d) => d.id === s.id));

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (renameBusy) return;
    setRenameBusy(true);
    setRenameError(null);
    try {
      if (!newName.trim()) throw new Error("Nama kelas wajib diisi.");
      await renameClass(cls.id, cls.name, newName.trim());
      setNotice({ kind: "ok", text: `Nama kelas diubah menjadi ${newName.trim()}. Nama kelas lama pada profil pengguna juga diperbarui.` });
      setLiveMessage(`Nama kelas diubah menjadi ${newName.trim()}.`);
      await reload();
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
    const target = data!.allStudents.find((s) => s.id === studentId);
    if (!target) return;
    const fromName = target.className ?? "tanpa kelas";
    const confirmed = confirm(
      `Pindahkan ${target.name} dari kelas ${fromName} ke kelas ${cls.name}? Riwayat nilai dan tugas siswa tetap tersimpan.`
    );
    if (!confirmed) return;
    setMoveBusy(true);
    setMoveError(null);
    try {
      await moveStudent(target.id, cls.id, cls.name);
      setNotice({ kind: "ok", text: `${target.name} dipindahkan ke ${cls.name}.` });
      setLiveMessage(`${target.name} dipindahkan ke ${cls.name}.`);
      setStudentId("");
      await reload();
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
      const teacher = teachers.find((t) => t.id === teacherId);
      await assignTeaching(cls.id, teacherId, subject.trim());
      setNotice({ kind: "ok", text: `${teacher?.name ?? "Guru"} ditugaskan mengajar ${subject.trim()}.` });
      setLiveMessage(`${teacher?.name ?? "Guru"} ditugaskan mengajar ${subject.trim()}.`);
      setTeacherId("");
      setSubject("");
      await reload();
    } catch (err) {
      setAssignError((err as Error).message);
      setNotice({ kind: "error", text: (err as Error).message });
    } finally {
      setAssignBusy(false);
    }
  }

  async function handleRemove(teacherIdToRemove: string, teacherName: string, subjectToRemove: string) {
    if (!confirm(`Hapus penugasan ${teacherName} untuk mapel ${subjectToRemove} di kelas ini?`)) return;
    try {
      await removeTeaching(cls.id, teacherIdToRemove, subjectToRemove);
      setNotice({ kind: "ok", text: `Penugasan ${teacherName} (${subjectToRemove}) dihapus.` });
      setLiveMessage(`Penugasan ${teacherName} dihapus.`);
      await reload();
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
            <CustomSelect
              id="move-student"
              value={studentId}
              onChange={setStudentId}
              options={moveCandidates.map((s) => ({
                value: s.id,
                label: `${s.name} — ${s.className ?? "tanpa kelas"}`,
              }))}
              placeholder="Pilih siswa…"
              searchPlaceholder="Cari siswa…"
              ariaLabel="Pindahkan siswa ke kelas ini"
            />
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
            <CustomSelect
              id="assign-teacher"
              value={teacherId}
              onChange={setTeacherId}
              options={teachers.map((t) => ({
                value: t.id,
                label: t.subject ? `${t.name} — ${t.subject}` : t.name,
              }))}
              placeholder="Pilih guru aktif…"
              searchPlaceholder="Cari guru…"
              ariaLabel="Guru"
            />
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
