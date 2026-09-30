"use client";

import { useRef, useState } from "react";
import { update, useDB, type User as StoreUser } from "@/lib/store";
import { generateTemporaryPassword } from "@/lib/admin-demo";
import AccountForm, { emptyAccountValues, type AccountFormValues } from "./account-form";
import AdminSkeleton from "@/components/admin/admin-skeleton";

export type ManagedAccount = {
  id: number;
  role: "student" | "teacher";
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  className: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
};

type ListState = {
  users: ManagedAccount[];
  page: number;
  pageSize: number;
  total: number;
};

const PAGE_SIZE = 20;
const DEFAULT_PREFS = '{"task":true,"deadline":true,"ai":false,"email":false}';

function toManaged(u: StoreUser): ManagedAccount {
  return {
    id: u.id,
    role: u.role,
    name: u.name,
    email: u.email,
    phone: u.phone,
    subject: u.subject,
    className: u.className,
    isActive: u.isActive !== false,
    mustChangePassword: u.mustChangePassword === true,
  };
}

/**
 * Search, filter and paginate school accounts; create, edit, deactivate and
 * reset them. Frontend-only: every mutation runs against the in-browser store,
 * and the one-time temporary password is shown only inside a panel that
 * requires explicit dismissal and is never persisted.
 */
export default function AccountManager() {
  const db = useDB();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"" | "student" | "teacher">("");
  const [classId, setClassId] = useState("");
  const [active, setActive] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [createValues, setCreateValues] = useState<AccountFormValues>(emptyAccountValues);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [credential, setCredential] = useState<{ name: string; email: string; role: string; temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [editTarget, setEditTarget] = useState<ManagedAccount | null>(null);
  const [editValues, setEditValues] = useState<AccountFormValues>(emptyAccountValues);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const classes = (db?.classes ?? [])
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Computed inline (not memoized on the db object): the store mutates in
  // place, so the object identity never changes after mutations.
  const list: ListState | null = (() => {
    if (!db) return null;
    const needle = q.trim().toLowerCase();
    const filtered = db.users
      .map(toManaged)
      .filter((u) => {
        if (role && u.role !== role) return false;
        if (active && u.isActive !== (active === "true")) return false;
        if (needle && !u.name.toLowerCase().includes(needle) && !u.email.toLowerCase().includes(needle)) return false;
        if (classId) {
          const cid = Number(classId);
          const enrolled = db.enrollments.some((e) => e.classId === cid && e.studentId === u.id);
          if (!enrolled) return false;
        }
        return true;
      });
    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    return { users: filtered.slice(start, start + PAGE_SIZE), page, pageSize: PAGE_SIZE, total };
  })();

  const totalPages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  function announce(text: string) {
    setAnnouncement(text);
    setNotice(null);
  }

  function openCreate() {
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    setCreateValues(emptyAccountValues);
    setCreateError(null);
    setCredential(null);
    requestAnimationFrame(() => createDialogRef.current?.showModal());
  }

  function closeCreate() {
    createDialogRef.current?.close();
    setCredential(null);
    lastActiveRef.current?.focus();
  }

  function handleCreate() {
    setCreateBusy(true);
    setCreateError(null);
    try {
      const email = createValues.email.trim().toLowerCase();
      const temporaryPassword = generateTemporaryPassword();
      const created = update((d) => {
        if (d.users.some((u) => u.email.toLowerCase() === email)) {
          throw new Error("Email sudah terdaftar.");
        }
        const cls =
          createValues.role === "student"
            ? d.classes.find((c) => c.id === Number(createValues.classId))
            : undefined;
        if (createValues.role === "student" && !cls) {
          throw new Error("Pilih kelas yang valid untuk siswa.");
        }
        const user: StoreUser = {
          id: d.nextId++,
          role: createValues.role,
          name: createValues.name.trim(),
          email,
          phone: createValues.phone.trim(),
          password: temporaryPassword,
          className: cls?.name ?? null,
          subject: createValues.role === "teacher" ? createValues.subject.trim() : null,
          avatar: "",
          prefs: DEFAULT_PREFS,
          isActive: true,
          mustChangePassword: true,
        };
        d.users.push(user);
        if (cls) d.enrollments.push({ classId: cls.id, studentId: user.id });
        return user;
      });
      setCredential({
        name: created.name,
        email: created.email,
        role: created.role,
        temporaryPassword,
      });
      setCopied(false);
      announce(`Akun ${created.name} berhasil dibuat.`);
    } catch (err) {
      // Inline error inside the dialog; a global notice would sit behind the overlay.
      setCreateError((err as Error).message);
    } finally {
      setCreateBusy(false);
    }
  }

  function openEdit(u: ManagedAccount) {
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    setEditTarget(u);
    setEditValues({
      role: u.role,
      name: u.name,
      email: u.email,
      phone: u.phone,
      classId: "",
      subject: u.subject ?? "",
    });
    setEditError(null);
    requestAnimationFrame(() => editDialogRef.current?.showModal());
  }

  function closeEdit() {
    editDialogRef.current?.close();
    setEditTarget(null);
    lastActiveRef.current?.focus();
  }

  function handleEdit() {
    if (!editTarget) return;
    setEditBusy(true);
    setEditError(null);
    try {
      const email = editValues.email.trim().toLowerCase();
      const updated = update((d) => {
        if (d.users.some((u) => u.id !== editTarget.id && u.email.toLowerCase() === email)) {
          throw new Error("Email sudah dipakai akun lain.");
        }
        const u = d.users.find((row) => row.id === editTarget.id);
        if (!u) throw new Error("Pengguna tidak ditemukan.");
        u.name = editValues.name.trim();
        u.email = email;
        u.phone = editValues.phone.trim();
        if (editTarget.role === "teacher") u.subject = editValues.subject.trim();
        return u;
      });
      setNotice({ kind: "ok", text: `Profil ${updated.name} diperbarui.` });
      announce(`Profil ${updated.name} diperbarui.`);
      closeEdit();
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditBusy(false);
    }
  }

  function toggleActive(u: ManagedAccount) {
    const verb = u.isActive ? "menonaktifkan" : "mengaktifkan kembali";
    if (!confirm(`Yakin ${verb} akun ${u.name}?${u.isActive ? " Sesi yang sedang berjalan akan ditutup." : ""}`)) return;
    try {
      update((d) => {
        const target = d.users.find((row) => row.id === u.id);
        if (!target) throw new Error("Pengguna tidak ditemukan.");
        target.isActive = !u.isActive;
      });
      setNotice({ kind: "ok", text: u.isActive ? `${u.name} dinonaktifkan.` : `${u.name} diaktifkan kembali.` });
      announce(u.isActive ? `${u.name} dinonaktifkan.` : `${u.name} diaktifkan kembali.`);
    } catch (err) {
      setNotice({ kind: "error", text: (err as Error).message });
    }
  }

  function resetPassword(u: ManagedAccount) {
    if (!confirm(`Terbitkan kata sandi sementara baru untuk ${u.name}? Sesi lama akan ditutup dan akun wajib mengganti sandi saat login berikutnya.`)) return;
    try {
      const temporaryPassword = generateTemporaryPassword();
      update((d) => {
        const target = d.users.find((row) => row.id === u.id);
        if (!target) throw new Error("Pengguna tidak ditemukan.");
        target.password = temporaryPassword;
        target.mustChangePassword = true;
      });
      setCredential({ name: u.name, email: u.email, role: u.role, temporaryPassword });
      setCopied(false);
      requestAnimationFrame(() => createDialogRef.current?.showModal());
      announce(`Kata sandi sementara baru diterbitkan untuk ${u.name}.`);
    } catch (err) {
      setNotice({ kind: "error", text: (err as Error).message });
    }
  }

  async function copyCredential() {
    if (!credential) return;
    try {
      await navigator.clipboard.writeText(credential.temporaryPassword);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const startItem = ((list?.page ?? 1) - 1) * PAGE_SIZE + 1;
  const endItem = list ? Math.min(list.total, list.page * PAGE_SIZE) : 0;

  // The store fills in after mount; without this the table renders empty and
  // then pops in. The admin shell lives in the route layout, so a skeleton
  // here only affects the main column.
  if (!db) return <AdminSkeleton />;

  return (
    <>
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {announcement}
      </div>

      <div className="adm-toolbar">
        <div className="search-box">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Cari nama atau email…"
            aria-label="Cari akun"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          aria-label="Filter peran"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as "" | "student" | "teacher");
            setPage(1);
          }}
        >
          <option value="">Semua peran</option>
          <option value="student">Siswa</option>
          <option value="teacher">Guru</option>
        </select>
        <select
          aria-label="Filter kelas"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Semua kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter status"
          value={active}
          onChange={(e) => {
            setActive(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="">Semua status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah akun
        </button>
      </div>

      {notice ? (
        <p
          role="status"
          style={{
            marginTop: 14,
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

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th scope="col">Akun</th>
              <th scope="col">Peran</th>
              <th scope="col">Kelas / Mapel</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list?.users.map((u) => (
              <tr key={u.id}>
                <td className="cell-main">
                  <b>{u.name}</b>
                  <span>{u.email}</span>
                </td>
                <td>
                  <span className={"pill " + (u.role === "teacher" ? "pill-purple" : "pill-blue")}>
                    {u.role === "teacher" ? "Guru" : "Siswa"}
                  </span>
                </td>
                <td>{u.role === "student" ? u.className ?? "—" : u.subject ?? "—"}</td>
                <td>
                  <span className={"pill " + (u.isActive ? "pill-green" : "pill-red")}>
                    {u.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button type="button" className="btn-mini" onClick={() => openEdit(u)}>
                      Ubah
                    </button>
                    <button type="button" className="btn-mini btn-mini-purple" onClick={() => resetPassword(u)}>
                      Reset Sandi
                    </button>
                    <button type="button" className="btn-mini btn-mini-danger" onClick={() => toggleActive(u)}>
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {list && list.users.length === 0 ? (
          <div className="adm-empty">
            <span className="ic" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <b>Tidak ada akun yang cocok</b>
            <p>Ubah filter pencarian atau buat akun baru untuk sekolah ini.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              Tambah akun
            </button>
          </div>
        ) : null}
      </div>

      {list && list.total > 0 ? (
        <div className="adm-pager">
          <span>
            Menampilkan {startItem}–{endItem} dari {list.total} akun
          </span>
          <button type="button" className="btn-mini" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹ Sebelumnya
          </button>
          <span>
            Halaman {page} / {totalPages}
          </span>
          <button type="button" className="btn-mini" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Berikutnya ›
          </button>
        </div>
      ) : null}

      {/* create dialog / credential panel */}
      <dialog className="gdialog" ref={createDialogRef} onClose={closeCreate}>
        <div className="gdialog-head">
          <div>
            <h3>{credential ? "Kata Sandi Sementara" : "Tambah Akun"}</h3>
            <p>
              {credential
                ? "Bagikan melalui saluran komunikasi sekolah. Kata sandi ini hanya ditampilkan sekali."
                : "Buat akun siswa atau guru dengan kata sandi sementara."}
            </p>
          </div>
          <button className="gdialog-close" aria-label="Tutup" onClick={closeCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {credential ? (
          <div className="gdialog-body" style={{ paddingBottom: 0 }}>
            <div className="adm-cred">
              <b>
                {credential.name} ({credential.role === "teacher" ? "Guru" : "Siswa"})
              </b>
              <p>
                Email masuk: <strong>{credential.email}</strong>
              </p>
              <label htmlFor="temp-password-value" style={{ display: "block", fontSize: 13, fontWeight: 500, marginTop: 12 }}>
                Kata sandi sementara
              </label>
              <div className="row">
                <input id="temp-password-value" type="text" readOnly value={credential.temporaryPassword} onFocus={(e) => e.currentTarget.select()} />
                <button type="button" className="btn btn-outline btn-sm" onClick={copyCredential}>
                  {copied ? "Tersalin ✓" : "Salin"}
                </button>
              </div>
              <p style={{ marginTop: 10 }}>
                Pengguna wajib mengganti kata sandi ini pada login pertama sebelum dapat memakai aplikasi.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={closeCreate}>
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="gdialog-body" style={{ paddingBottom: 0 }}>
              <AccountForm
                mode="create"
                formId="form-create-account"
                values={createValues}
                onChange={setCreateValues}
                classes={classes}
                busy={createBusy}
                serverError={createError}
                onSubmit={handleCreate}
                submitLabel={createBusy ? "Membuat…" : "Buat akun"}
                onCancel={closeCreate}
              />
            </div>
          </>
        )}
      </dialog>

      {/* edit dialog */}
      <dialog className="gdialog" ref={editDialogRef} onClose={() => setEditTarget(null)}>
        <div className="gdialog-head">
          <div>
            <h3>Ubah Akun</h3>
            <p>Peran akun tidak dapat diubah. Kelola status aktif dari tabel.</p>
          </div>
          <button className="gdialog-close" aria-label="Tutup" onClick={closeEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="gdialog-body" style={{ paddingBottom: 0 }}>
          {editTarget ? (
            <AccountForm
              mode="edit"
              formId="form-edit-account"
              values={editValues}
              onChange={setEditValues}
              classes={classes}
              busy={editBusy}
              serverError={editError}
              onSubmit={handleEdit}
              submitLabel={editBusy ? "Menyimpan…" : "Simpan perubahan"}
              onCancel={closeEdit}
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
}
