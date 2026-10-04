-- Migrasi 2026-10-05
-- Foto profil default baru: defaultpfp.jpg (terang) / defaultpfp-dark.jpg
-- (gelap, ditukar lewat CSS .dark img[src=...]). Nilai lama /assets/logo.png
-- dipindahkan agar semua akun existing ikut berganti.

ALTER TABLE public.profiles
  ALTER COLUMN avatar SET DEFAULT '/assets/defaultpfp.jpg';

UPDATE public.profiles
SET avatar = '/assets/defaultpfp.jpg'
WHERE avatar IS NULL
   OR avatar = ''
   OR avatar = '/assets/logo.png';
