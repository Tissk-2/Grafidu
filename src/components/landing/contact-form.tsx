"use client";

import { useState, useTransition } from "react";
import { submitLead } from "@/app/actions/contact";
import CustomSelect from "@/components/ui/custom-select";

const EMPTY = { name: "", email: "", school: "", students: "", message: "" };

const STUDENT_RANGES = ["Kurang dari 100", "100 – 300", "300 – 800", "800+"];

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function update(key: keyof typeof EMPTY) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setSent(false);
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    startTransition(async () => {
      const result = await submitLead(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.gtoast?.("Terima kasih! Tim kami akan menghubungi Anda.");
      setForm(EMPTY);
      setSent(true);
    });
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-field">
        <label htmlFor="cf-name">Nama lengkap</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          required
          value={form.name}
          onChange={update("name")}
        />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-email">Email sekolah</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@sekolah.sch.id"
          required
          value={form.email}
          onChange={update("email")}
        />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-school">Sekolah / institusi</label>
        <input
          id="cf-school"
          name="school"
          type="text"
          autoComplete="organization"
          placeholder="cth. SMK Negeri 2 Surabaya"
          required
          value={form.school}
          onChange={update("school")}
        />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-students">
          Perkiraan jumlah siswa <span className="opt">(seluruh sekolah)</span>
        </label>
        <CustomSelect
          id="cf-students"
          value={form.students}
          onChange={(students) => {
            setForm((f) => ({ ...f, students }));
            setSent(false);
          }}
          options={STUDENT_RANGES.map((r) => ({ value: r, label: r }))}
          placeholder="Pilih rentang"
          ariaLabel="Perkiraan jumlah siswa"
        />
      </div>
      <div className="contact-field">
        <label htmlFor="cf-message">Apa kebutuhan sekolah Anda?</label>
        <textarea
          id="cf-message"
          name="message"
          placeholder="Ceritakan tentang kelas Anda, sistem yang sedang dipakai, atau apa yang ingin dilihat dalam demo."
          required
          value={form.message}
          onChange={update("message")}
        />
      </div>

      {error ? (
        <p role="alert" style={{ fontSize: 13, color: "var(--red)", margin: 0 }}>
          {error}
        </p>
      ) : null}
      {sent && !error ? (
        <p role="status" style={{ fontSize: 13, color: "var(--green)", margin: 0 }}>
          Pesan Anda sudah kami terima. Sampai jumpa di inbox!
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim pesan"}
      </button>
    </form>
  );
}
