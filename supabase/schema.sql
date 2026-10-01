-- ============================================================
-- GRAFIDU — skema database
-- Cara pakai: Supabase Dashboard → SQL Editor → New query →
-- tempel seluruh file ini → Run.
-- Aman dijalankan ulang (idempoten).
-- Catatan: tabel `profiles` diasumsikan SUDAH ADA dengan kolom:
--   id uuid PK, email text, name text, role text,
--   class_name text, avatar text, created_at timestamptz
-- ============================================================

-- ---------- tabel inti ----------

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create table if not exists teachings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  teacher_id uuid not null references profiles (id) on delete cascade,
  subject text not null,
  created_at timestamptz not null default now(),
  unique (class_id, teacher_id, subject)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  created_by uuid references profiles (id) on delete set null,
  title text not null,
  description text not null default '',
  subject text not null default 'Umum',
  assigned_at timestamptz not null default now(),
  due_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists task_statuses (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks (id) on delete cascade,
  student_id uuid not null references profiles (id) on delete cascade,
  done boolean not null default false,
  submitted_at timestamptz,
  grade int check (grade is null or (grade >= 0 and grade <= 100)),
  feedback text not null default '',
  created_at timestamptz not null default now(),
  unique (task_id, student_id)
);

create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles (id) on delete cascade,
  subject text not null,
  kind text not null default 'Ulangan',
  score int not null check (score >= 0 and score <= 100),
  grade_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes (id) on delete cascade,
  created_by uuid references profiles (id) on delete set null,
  title text not null,
  topic text not null default '',
  difficulty text not null default 'Sedang',
  num_questions int not null default 10,
  duration_min int not null default 20,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes (id) on delete cascade,
  idx int not null,
  text text not null
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles (id) on delete set null,
  class_id uuid not null references classes (id) on delete cascade,
  title text not null,
  pages int not null default 0,
  status text not null default 'draft',
  views int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null check (role in ('user', 'ai')),
  text text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- index ----------

create index if not exists enrollments_class_id_idx on enrollments (class_id);
create index if not exists enrollments_student_id_idx on enrollments (student_id);
create index if not exists teachings_class_id_idx on teachings (class_id);
create index if not exists tasks_class_id_idx on tasks (class_id);
create index if not exists tasks_due_at_idx on tasks (due_at);
create index if not exists task_statuses_task_id_idx on task_statuses (task_id);
create index if not exists task_statuses_student_id_idx on task_statuses (student_id);
create index if not exists grades_student_id_idx on grades (student_id);
create index if not exists todos_user_id_idx on todos (user_id);
create index if not exists announcements_created_at_idx on announcements (created_at desc);

-- ---------- RLS ----------

alter table classes enable row level security;
alter table enrollments enable row level security;
alter table teachings enable row level security;
alter table tasks enable row level security;
alter table task_statuses enable row level security;
alter table grades enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table materials enable row level security;
alter table announcements enable row level security;
alter table todos enable row level security;
alter table chat_messages enable row level security;

-- profiles: baca + ubah baris sendiri (login aplikasi bergantung pada ini)
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select using (auth.uid() = id);
drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- Data sekolah: semua user login boleh baca; tulis untuk peran login.
-- (Kencangkan nanti bila perlu, mis. hanya guru yang boleh insert tasks.)
drop policy if exists "authenticated read" on classes;
create policy "authenticated read" on classes
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on classes;
create policy "authenticated write" on classes
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on enrollments;
create policy "authenticated read" on enrollments
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on enrollments;
create policy "authenticated write" on enrollments
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on teachings;
create policy "authenticated read" on teachings
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on teachings;
create policy "authenticated write" on teachings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on tasks;
create policy "authenticated read" on tasks
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on tasks;
create policy "authenticated write" on tasks
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Status pengumpulan: baca semua yang login (guru perlu rekap kelas),
-- tulis hanya baris milik sendiri.
drop policy if exists "authenticated read" on task_statuses;
create policy "authenticated read" on task_statuses
  for select using (auth.role() = 'authenticated');
drop policy if exists "insert own status" on task_statuses;
create policy "insert own status" on task_statuses
  for insert with check (student_id = auth.uid());
drop policy if exists "update own status" on task_statuses;
create policy "update own status" on task_statuses
  for update using (student_id = auth.uid());

drop policy if exists "authenticated read" on grades;
create policy "authenticated read" on grades
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on grades;
create policy "authenticated write" on grades
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on quizzes;
create policy "authenticated read" on quizzes
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on quizzes;
create policy "authenticated write" on quizzes
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on quiz_questions;
create policy "authenticated read" on quiz_questions
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on quiz_questions;
create policy "authenticated write" on quiz_questions
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on materials;
create policy "authenticated read" on materials
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on materials;
create policy "authenticated write" on materials
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "authenticated read" on announcements;
create policy "authenticated read" on announcements
  for select using (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on announcements;
create policy "authenticated write" on announcements
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- To-do & chat: hanya milik sendiri.
drop policy if exists "own todos" on todos;
create policy "own todos" on todos
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "own chat" on chat_messages;
create policy "own chat" on chat_messages
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- storage: avatar profil ----------
-- Dipakai tombol "Ubah Foto" di halaman Pengaturan. Setiap user hanya boleh
-- menulis di foldernya sendiri: avatars/<auth.uid>/…
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar read" on storage.objects;
create policy "avatar read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar insert" on storage.objects;
create policy "avatar insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar update" on storage.objects;
create policy "avatar update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- CONTOH ISI DATA (hapus tanda -- untuk menjalankan)
-- Ganti uuid di bawah dengan id user dari tabel profiles.
-- ============================================================
-- insert into classes (name) values ('XI RPL A'), ('XI RPL B'), ('XI RPL C');
--
-- insert into enrollments (class_id, student_id)
-- select c.id, p.id from classes c, profiles p
-- where c.name = 'XI RPL B' and p.email = 'siswa@sekolah.sch.id';
--
-- insert into teachings (class_id, teacher_id, subject)
-- select c.id, p.id, 'Matematika' from classes c, profiles p
-- where c.name = 'XI RPL B' and p.email = 'guru@sekolah.sch.id';
