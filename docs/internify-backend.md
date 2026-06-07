# Internify Backend Overview

Dokumen ini merangkum struktur, alur kerja, dan komponen backend Internify (Express.js + Prisma + MySQL). Fokus hanya pada backend.

## Ringkasan singkat

- Backend melayani dua role utama: admin dan mahasiswa.
- Fitur inti: manajemen lowongan, lamaran, batch, data mahasiswa, partnership, hasil riset, FAQ, dan feedback.
- Arsitektur modul menerapkan pola 4 layer: route -> controller -> service -> repository -> Prisma.

## Struktur folder utama

```
prisma/                 Prisma schema dan migrasi
src/
  index.js              Entry point server Express
  docs/                 Swagger config dan SQL dump lama
  helpers/              Utilitas umum (wrapper, validator, error, db, mail, file)
  middleware/           JWT, role guard, multer, recaptcha
  modules/              Modul fitur (admin, auth, batch, dll)
  routes/               Routing per fitur
  uploads/              Folder upload lokal (dev)
oldCode/                Kode lama berbasis query SQL
```

## Entry point dan request flow

- Entry point: `src/index.js`.
- Mendaftarkan CORS, JSON body, dan static file `/uploads`.
- Memasang route per fitur:
  - `/admin-api`
  - `/auth-api`
  - `/lowongan-magang-api`
  - `/lamaran-magang-api`
  - `/mahasiswa-api`
  - `/partnership-api`
  - `/hasil-research-api`
  - `/faq-api`
  - `/feedback-api`
  - `/batch-api`
- Swagger UI di `/api-docs` (aktif jika environment mengizinkan).

Alur umum request:

1. Route memanggil controller.
2. Controller validasi input (Joi) dan memanggil service.
3. Service menjalankan business logic dan memanggil repository.
4. Repository menjalankan query Prisma.
5. Response dibungkus dengan helper `wrapper` untuk format yang konsisten.

## Konfigurasi dan environment

- Template env ada di `.env.example`.
- Config global di `src/helpers/infra/global_config.js`.
- Token JWT memakai RSA key pair (RS256).
- `vercel.json` mengatur build dan route untuk Vercel.

## Database dan Prisma

- Prisma schema di `prisma/schema.prisma`.
- Generator Prisma client output ke `src/generated/prisma`.
- Model utama:
  - Admin
  - Mahasiswa
  - LowonganMagang
  - LamaranMagang
  - Batch
  - Partnership
  - HasilResearch
  - Faq
  - Feedback
  - RiwayatPelamar (statistik historis)
- Enum utama: Role, StudentRole, StatusLamaran, StatusLowongan, PaidStatus.

## Modul dan endpoint utama

### 1) Auth

Tujuan: login admin dan identitas user.

- POST `/auth-api/login`
- GET `/auth-api/me`

### 2) Admin

Tujuan: CRUD admin.

- POST `/admin-api/add`
- GET `/admin-api/get`

### 3) Batch

Tujuan: mengelola batch aktif dan urutan batch.

- POST `/batch-api/add`
- GET `/batch-api/`
- PUT `/batch-api/:id`
- DELETE `/batch-api/:id`
- PATCH `/batch-api/switch/:batch_number`

### 4) Lowongan Magang

Tujuan: CRUD lowongan, filter kelompok peminatan, status otomatis.

- POST `/lowongan-magang-api/add`
- GET `/lowongan-magang-api/get`
- GET `/lowongan-magang-api/get/id/:id`
- GET `/lowongan-magang-api/get/kelompok/:kelompok_peminatan`
- GET `/lowongan-magang-api/get/kelompok-all`
- PATCH `/lowongan-magang-api/update/:id`
- DELETE `/lowongan-magang-api/delete/:id`

### 5) Lamaran Magang

Tujuan: apply magang, export, statistik.

- POST `/lamaran-magang-api/add/:id_lowongan_magang`
- POST `/lamaran-magang-api/add-mobile/:id_lowongan_magang`
- GET `/lamaran-magang-api/get`
- GET `/lamaran-magang-api/get/:id_lamaran_magang`
- PATCH `/lamaran-magang-api/update/:id_lamaran_magang`
- GET `/lamaran-magang-api/export`
- DELETE `/lamaran-magang-api/delete/:id`
- GET `/lamaran-magang-api/statistics/dashboard`
- GET `/lamaran-magang-api/statistics/position`
- GET `/lamaran-magang-api/statistics/country`
- GET `/lamaran-magang-api/statistics/university`

### 6) Mahasiswa

Tujuan: list mahasiswa (admin).

- GET `/mahasiswa-api/get`

### 7) Partnership

Tujuan: CRUD partnership dan upload logo.

- POST `/partnership-api/add`
- GET `/partnership-api/get`
- GET `/partnership-api/get/:id`
- PATCH `/partnership-api/update/:id`
- DELETE `/partnership-api/delete/:id`

### 8) Hasil Research

Tujuan: CRUD hasil riset dan upload gambar.

- POST `/hasil-research-api/add`
- GET `/hasil-research-api/get`
- GET `/hasil-research-api/get/:id`
- PATCH `/hasil-research-api/update/:id`
- DELETE `/hasil-research-api/delete/:id`

### 9) FAQ

Tujuan: CRUD FAQ.

- GET `/faq-api/get`
- GET `/faq-api/get/:id`
- POST `/faq-api/add`
- PATCH `/faq-api/update/:id`
- DELETE `/faq-api/delete/:id`

### 10) Feedback

Tujuan: CRUD feedback, filter batch dan tahun, upload gambar.

- POST `/feedback-api/add`
- GET `/feedback-api/get`
- GET `/feedback-api/get/:id`
- PATCH `/feedback-api/update/:id`
- DELETE `/feedback-api/delete/:id`

## Middleware penting

- `verifyJWT`: validasi JWT RSA (RS256), set `req.id`, `req.role`.
- `isAdmin`: guard role admin.
- `multer`: upload file + size check + error handler.
- `recaptcha`: verifikasi reCAPTCHA (saat ini tidak diaktifkan pada route lamaran utama).

## Helper penting

- `wrapper`: format response konsisten dan mapping error ke HTTP code.
- `validator`: validasi payload menggunakan Joi.
- `fileHelper`: hapus file, cek file, dan validasi path file.
- `imageUpload.helper`: normalisasi path upload.
- `mail`: transporter Nodemailer.

## Uploads dan file storage

- Lokasi upload dev: `src/uploads`.
- Lokasi upload production: `/tmp/uploads`.
- File yang diupload dibersihkan otomatis saat validasi gagal atau error.

## Email

- Email konfirmasi dan status lamaran dikirim dari module lamaran.
- Template HTML ada di `src/modules/lamaranMagang/helpers/email.helper.js`.

## Swagger

- Swagger config di `src/docs/swagger.js`.
- Route dokumentasi di `/api-docs`.

## Legacy (oldCode)

Folder `oldCode/` berisi controller dan model lama berbasis query SQL langsung. Saat ini tidak dipakai oleh entry point utama.

## Catatan teknis penting

- JWT menggunakan RSA key pair (RS256), bukan HS256.
- Setiap mahasiswa hanya boleh melamar satu posisi (check pada lamaran).
- Status lowongan dihitung otomatis dari durasi awal dan akhir.
- Statistik negara dan universitas menggunakan raw query karena join kompleks.
- Prisma client utama dipakai dari `helpers/db/db_connection.js`.

## Paragraf laporan backend (siap pakai)

Backend Internify dibangun menggunakan Express.js sebagai web framework dengan Prisma ORM dan MySQL sebagai basis data. Arsitektur modular menerapkan pola 4 layer (route, controller, service, repository) agar alur bisnis terstruktur dan mudah dirawat, sementara validasi input dilakukan dengan Joi dan response distandarkan melalui wrapper. Autentikasi admin menggunakan JWT berbasis RSA (RS256), disertai middleware role guard untuk keamanan. Fitur upload file dikelola oleh Multer dengan pengecekan ukuran serta mekanisme cleanup, dan notifikasi email dikirim menggunakan Nodemailer. Dokumentasi API disediakan melalui Swagger untuk memudahkan pengujian dan integrasi.
