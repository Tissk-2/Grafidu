-- ============================================================
-- GRAFIDU — samakan semua password jadi "grafidu123"
-- + hapus kolom password di profiles (tidak dipakai login)
--
-- Cara pakai: Supabase Dashboard → SQL Editor → New query →
-- tempel seluruh file ini → Run.
--
-- PENTING: jangan tambah kolom "password" di auth.users.
-- Login Supabase Auth hanya baca kolom `encrypted_password`
-- (bcrypt). Kolom custom tidak akan dipakai dan bisa merusak Auth.
-- ============================================================

-- pgcrypto dibutuhkan untuk fungsi crypt() / gen_salt()
create extension if not exists pgcrypto;

-- 1) Perbaiki NULL di kolom token (penyebab 500 kemarin).
--    GoTrue baca kolom ini sebagai string, NULL = scan error.
update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    phone_change = coalesce(phone_change, ''),
    phone_change_token = coalesce(phone_change_token, '')
where confirmation_token is null
   or recovery_token is null
   or email_change is null
   or email_change_token_new is null
   or email_change_token_current is null
   or phone_change is null
   or phone_change_token is null;

-- 2) Reset password SEMUA user auth jadi "grafidu123".
--    crypt(..., gen_salt('bf')) = format bcrypt yang dimengerti GoTrue,
--    jadi login dengan password "grafidu123" akan lolos.
update auth.users
set encrypted_password = crypt('grafidu123', gen_salt('bf')),
    updated_at = now();

-- 2) Hapus kolom password di profiles kalau masih ada.
--    Kolom ini tidak dipakai aplikasi (login cek ke auth.users),
--    dan 1 barisnya berisi plaintext = risiko bocor.
alter table public.profiles drop column if exists password;

-- 3) Verifikasi (jalankan terpisah untuk cek hasil):
-- select count(*) as total_auth_users from auth.users;
-- select column_name from information_schema.columns
--  where table_schema = 'public' and table_name = 'profiles';
