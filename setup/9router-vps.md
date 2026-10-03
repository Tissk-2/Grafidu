# 9Router di VPS — AI Grafidu 24/7

9Router (`https://9router.com`, MIT) adalah gateway model AI yang berjalan di
mesin yang sama dengan aplikasi. Aplikasi memanggil endpoint
OpenAI-compatible-nya lewat loopback; 9Router yang meneruskan ke provider
(OpenCode Free, OpenRouter, dll.) dan menangani fallback antar provider.

```
Browser ──▶ Next.js (server) ──▶ 9Router 127.0.0.1:20128 ──▶ provider model
             /api/ai/*              (localhost saja!)
```

> Jangan pernah membuka port 20128 di firewall / panel Webuzo. Router memegang
> kredensial provider — hanya aplikasi yang boleh menjangkaunya.

---

## 1. Install (sekali)

```bash
npm install -g 9router
```

## 2. Jalankan sementara untuk konfigurasi (sekali)

PENTING: default 9Router bind ke `0.0.0.0` (ter-expose ke internet!). Selalu
pakai `--host 127.0.0.1`.

```bash
9router --host 127.0.0.1 --no-browser
```

Dashboard-nya berjalan di `127.0.0.1:20128` — karena VPS headless, akses
lewat SSH tunnel dari laptop:

```bash
ssh -L 20128:127.0.0.1:20128 grafidu_admin@IP_VPS
# lalu buka http://localhost:20128 di browser laptop
```

Di dashboard:

1. Hubungkan provider gratis yang dipakai (mis. OpenCode Free — OAuth, ikuti
   arahan dashboard; atau OpenRouter / Qwen / NVIDIA NIM dengan API key).
2. Buat **API Key** (menu API Keys) — ini yang dipakai aplikasi Grafidu.
3. (Opsional) susun **Combo** agar satu nama model otomatis fallback antar
   provider saat kuota habis. Combo pertama biasanya bernama `First_combo`.
4. Cek daftar id model yang tersedia:
   `curl -s http://127.0.0.1:20128/v1/models -H "Authorization: Bearer sk-..."`.

## 3. Service systemd (biar jalan 24/7 & hidup lagi setelah reboot)

Simpan sebagai `/etc/systemd/system/9router.service`:

```ini
[Unit]
Description=9Router — AI model gateway untuk Grafidu
After=network-online.target

[Service]
Type=simple
User=grafidu_admin
ExecStart=%h/.npm-global/bin/9router --host 127.0.0.1 --no-browser --skip-update
Restart=always
RestartSec=5
# Jalur npm global bisa berbeda — cek dengan: which 9router

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now 9router
systemctl status 9router
```

> Sesuaikan `ExecStart` dengan path hasil `which 9router`
> (mis. `/usr/bin/9router` atau `/home/grafidu_admin/.npm-global/bin/9router`).
> `--skip-update` mencegah service mati sendiri saat ada prompt update.

## 4. Aplikasi: variabel env di VPS

Di folder aplikasi VPS, `.env.local` (file ini tidak di-commit) harus berisi,
di samping `DATABASE_URL`:

```bash
AI_ROUTER_URL=http://127.0.0.1:20128/v1
AI_MODEL=First_combo          # atau id model tunggal dari /v1/models
AI_ROUTER_KEY=sk-xxxxxxxx     # API Key dari dashboard 9Router
AI_TIMEOUT_MS=45000
```

Lalu deploy seperti biasa (lihat GUIDE.md): `npm ci`, `npm run build`,
salin `.next/static` + `public/` ke `.next/standalone`, dan
`sudo systemctl restart grafidu`.

Kalau service `grafidu` membaca env dari file EnvironmentFile, tambahkan
variabel AI di tempat yang sama — yang penting nilainya tersedia saat
`node server.js` start.

## 5. Verifikasi cepat

Dari VPS (tanpa perlu login aplikasi):

```bash
curl -s http://127.0.0.1:20128/v1/models -H "Authorization: Bearer $AI_ROUTER_KEY" | head -c 400
```

Lewat aplikasi (butuh login siswa/guru):

1. `/student/ai-agent` — tanya "Ringkas nilai saya semester ini" → jawaban
   model dari data nyata; "Buatkan to-do list" → to-do benar-benar muncul di
   halaman To-Do List.
2. `/teacher/ai-agent` — "Siswa mana yang perlu perhatian?" → jawaban model.
3. `/teacher/quiz-maker` — Generate Kuis dengan AI → soal baru (bukan template)
   tersimpan sebagai draft.

Kalau 9Router mati / tidak terjangkau, fitur AI menampilkan pesan error di
tempatnya (bubble chat dan toast Quiz Maker) — halaman lain tetap normal.
Karena itu service systemd + Restart=always di atas penting.

## 6. Catatan

- `AI_MODEL=First_combo` memakai combo bawaan (fallback antar semua provider
  yang terhubung). Ganti ke satu model (mis. `kc/qwen/qwen3.8-27b:free`)
  kalau mau perilaku deterministik.
- Beberapa provider menyisipkan artefak SSE (`data: [DONE]`) di akhir body —
  sudah ditangani parser di `src/lib/ai-router.ts`.
- Kuota gratis provider berubah-ubah; combo + fallback menjaga fitur tetap
  hidup. Pantau pemakaian di dashboard 9Router.
- Skrip verifikasi mandiri: `node setup/ai-router-verify.mjs chat|quiz`
  (membaca `.env.local`, memanggil router langsung).
