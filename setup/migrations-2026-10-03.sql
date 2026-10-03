-- DDL tambahan setelah dump 2026-10-03.
-- Terapkan manual ke database yang sudah ada:
--   psql "postgres://postgres@127.0.0.1:5432/grafidu_admin_database" -f setup/migrations-2026-10-03.sql

-- 1. Tabel leads dari formulir kontak di landing page (B2B).
CREATE TABLE IF NOT EXISTS public.contact_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    school text NOT NULL,
    students_range text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_leads_email_check CHECK (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

-- 2. Kunci unik untuk upsert nilai tugas dari saveGrade (guru menilai tugas),
--    agar task_statuses.grade dan grades tidak berkembang jadi dua sumber kebenaran.
CREATE UNIQUE INDEX IF NOT EXISTS grades_task_student_uidx ON public.grades (task_id, student_id);

-- 3. Tugas bisa menautkan satu materi (dropdown "Lampiran" di dialog Buat Tugas).
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS material_id uuid;
