"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listAccounts } from "@/app/actions/admin";
import type { AdminAccount } from "@/lib/admin-model";
import { generateTemporaryPassword } from "@/lib/password";
import AccountForm, { emptyAccountValues, type AccountFormValues } from "./account-form";
import AdminSkeleton from "@/components/admin/admin-skeleton";

type ListState = {
  accounts: AdminAccount[];
  page: number;
  pageSize: number;
  total: number;
};

const PAGE_SIZE = 20;

async function callAdminApi(input: string, init: RequestInit): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(input, init);
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return { ok: false, error: body.error ?? `Gagal (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: "Tidak bisa menghubungi server." };
  }
}

/**
 * Search, filter and paginate school accounts; create, edit, deactivate and
 * reset them. Data comes from Supabase (profiles/enrollments); creating an
 * account also registers the auth user via /api/admin/users, and the one-time
 * temporary password is shown only inside a panel that requires explicit
 * dismissal and is never persisted.
 */
export default function AccountManager() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listAccounts>> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [editValues, setEditValues] = useState<AccountFormValues>(emptyAccountValues);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const reload = useCallback(async () => {
    try {
      const next = await listAccounts();
      setData(next);
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const classes = data?.classes ?? [];

  const list: ListState | null = (() => {
    if (!data) return null;
    const needle = q.trim().toLowerCase();
    const filtered = data.accounts.filter((u) => {
      if (role && u.role !== role) return false;
      if (active && u.isActive !== (active === "true")) return false;
      if (needle && !u.name.toLowerCase().includes(needle) && !u.email.toLowerCase().includes(needle)) return false;
      if (classId && data.classByStudent.get(u.id) !== classId) return false;
      return true;
    });
    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    return { accounts: filtered.slice(start, start + PAGE_SIZE), page, pageSize: PAGE_SIZE, total };
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

  async function handleCreate() {
    setCreateBusy(true);
    setCreateError(null);
    const temporaryPassword = generateTemporaryPassword();
    const res = await callAdminApi("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: createValues.role,
        name: createValues.name.trim(),
        email: createValues.email.trim().toLowerCase(),
        phone: createValues.phone.trim(),
        classId: createValues.role === "student" ? createValues.classId : undefined,
        subject: createValues.role === "teacher" ? createValues.subject.trim() : undefined,
        password: temporaryPassword,
      }),
    });
    setCreateBusy(false);
    if (!res.ok) {
      setCreateError(res.error ?? "Gagal membuat akun.");
      return;
    }
    setCredential({
      name: createValues.name.trim(),
      email: createValues.email.trim().toLowerCase(),
      role: createValues.role,
      temporaryPassword,
    });
    setCopied(false);
    announce(`Akun ${createValues.name.trim()} berhasil dibuat.`);
    reload();
  }

  function openEdit(u: AdminAccount) {
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

  async function handleEdit() {
    if (!editTarget) return;
    setEditBusy(true);
    setEditError(null);
    const res = await callAdminApi(`/api/admin/users/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editValues.name.trim(),
        email: editValues.email.trim().toLowerCase(),
        phone: editValues.phone.trim(),
        subject: editTarget.role === "teacher" ? editValues.subject.trim() : undefined,
      }),
    });
    setEditBusy(false);
    if (!res.ok) {
      setEditError(res.error ?? "Gagal menyimpan perubahan.");
      return;
    }
    setNotice({ kind: "ok", text: `Profil ${editValues.name.trim()} diperbarui.` });
    announce(`Profil ${editValues.name.trim()} diperbarui.`);
    closeEdit();
    reload();
  }

  async function toggleActive(u: AdminAccount) {
    const verb = u.isActive ? "menonaktifkan" : "mengaktifkan kembali";
    if (!confirm(`Yakin ${verb} akun ${u.name}?${u.isActive ? " Sesi yang sedang berjalan akan ditutup." : ""}`)) return;
    const res = await callAdminApi(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    if (!res.ok) {
      setNotice({ kind: "error", text: res.error ?? "Gagal mengubah status akun." });
      return;
    }
    setNotice({ kind: "ok", text: u.isActive ? `${u.name} dinonaktifkan.` : `${u.name} diaktifkan kembali.` });
    announce(u.isActive ? `${u.name} dinonaktifkan.` : `${u.name} diaktifkan kembali.`);
    reload();
  }

  async function resetPassword(u: AdminAccount) {
    if (!confirm(`Terbitkan kata sandi sementara baru untuk ${u.name}? Sesi lama akan ditutup dan akun wajib mengganti sandi saat login berikutnya.`)) return;
    const temporaryPassword = generateTemporaryPassword();
    const res = await callAdminApi(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: temporaryPassword }),
    });
    if (!res.ok) {
      setNotice({ kind: "error", text: res.error ?? "Gagal menerbitkan kata sandi baru." });
      return;
    }
    setCredential({ name: u.name, email: u.email, role: u.role, temporaryPassword });
    setCopied(false);
    requestAnimationFrame(() => createDialogRef.current?.showModal());
    announce(`Kata sandi sementara baru diterbitkan untuk ${u.name}.`);
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

  // Data diambil dari Supabase setelah mount; tanpa ini tabel render kosong
  // lalu muncul mendadak. Shell admin ada di layout route, jadi skeleton di
  // sini hanya memengaruhi kolom utama.
  if (!data) {
    return loadError ? (
      <p
        role="alert"
        style={{
          marginTop: 16,
          fontSize: 13.5,
          padding: "10px 14px",
          borderRadius: 10,
          background: "var(--red-soft)",
          color: "#B0504C",
        }}
      >
        Gagal memuat akun: {loadError}. Pastikan skema supabase/schema.sql sudah dijalankan
        (kolom is_active pada profiles dan policy admin).
      </p>
    ) : (
      <AdminSkeleton />
    );
  }

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
            <option key={c.id} value={c.id}>
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
            {list?.accounts.map((u) => (
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

        {list && list.accounts.length === 0 ? (
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
        )}
      </dialog>

      {/* edit dialog */}
      <dialog className="gdialog" ref={editDialogRef} onClose={closeEdit}>
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
