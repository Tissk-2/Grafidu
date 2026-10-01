-- ============================================================
-- GRAFIDU — tambah kolom profiles yang dipakai kode tapi
-- belum ada di database (penyebab PostgREST 400 saat login).
--
-- Cara pakai: Supabase Dashboard → SQL Editor → New query →
-- tempel seluruh file ini → Run. Aman dijalankan ulang.
-- ============================================================

alter table public.profiles
  add column if not exists phone text,
  add column if not exists subject text,
  add column if not exists is_active boolean not null default true,
  add column if not exists must_change_password boolean not null default false;

-- Verifikasi:
-- select column_name, data_type from information_schema.columns
--  where table_schema = 'public' and table_name = 'profiles'
--  order by ordinal_position;
