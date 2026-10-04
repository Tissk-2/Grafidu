-- Migrasi 2026-10-04
-- 1. Jawaban & lampiran berkas pada pengumpulan tugas (task_statuses).
-- 2. Kuis pilihan ganda: opsi + kunci jawaban per soal, subject kuis,
--    dan tabel quiz_attempts (satu percobaan per siswa per kuis).
-- 3. grades.created_by: penanda guru pemilik nilai, agar area guru hanya
--    menampilkan nilai dari tugas/kuis miliknya sendiri (guru baru = kosong).

-- ---------------------------------------------------------------------------
-- 1. task_statuses: jawaban teks + lampiran berkas siswa
-- ---------------------------------------------------------------------------
ALTER TABLE public.task_statuses
  ADD COLUMN IF NOT EXISTS answer text NOT NULL DEFAULT '';
ALTER TABLE public.task_statuses
  ADD COLUMN IF NOT EXISTS attachment_url text;

-- ---------------------------------------------------------------------------
-- 2a. quiz_questions: opsi pilihan ganda + indeks kunci jawaban (0-based)
-- ---------------------------------------------------------------------------
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '[]';
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS answer_idx integer;

-- ---------------------------------------------------------------------------
-- 2b. quizzes: mapel kuis (diambil dari mapel amanah guru pembuat)
-- ---------------------------------------------------------------------------
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'Umum';

-- ---------------------------------------------------------------------------
-- 2c. quiz_attempts: hasil pengerjaan kuis siswa
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  quiz_id uuid NOT NULL,
  student_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]',
  score integer NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_attempts_quiz_id_fkey
    FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_attempts_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT quiz_attempts_quiz_student_key UNIQUE (quiz_id, student_id),
  CONSTRAINT quiz_attempts_score_check CHECK (((score >= 0) AND (score <= 100)))
);
CREATE INDEX IF NOT EXISTS quiz_attempts_student_idx
  ON public.quiz_attempts(student_id);

-- ---------------------------------------------------------------------------
-- 3. grades.created_by + backfill dari tugas terkait
-- ---------------------------------------------------------------------------
ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS created_by uuid;

UPDATE public.grades g
SET created_by = t.created_by
FROM public.tasks t
WHERE t.id = g.task_id
  AND g.created_by IS NULL;

CREATE INDEX IF NOT EXISTS grades_created_by_idx ON public.grades(created_by);
