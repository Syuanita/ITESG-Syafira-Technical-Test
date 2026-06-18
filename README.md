## Eagle Eye AI - QC Executive Dashboard

Sistem Inspeksi Kualitas Produksi Otomatis berbasis Artificial Intelligence, dikembangkan sebagai bagian dari Technical Test PT Eagle Sporting Goods.

## Deskripsi Proyek

Eagle Eye AI adalah aplikasi Fullstack yang dirancang untuk mengotomatisasi proses Quality Control (QC) di pabrik. Sistem ini memanfaatkan **Google Gemini AI (Vision)** untuk memindai foto produk, mendeteksi cacat fisik, memberikan skor kepercayaan (_confidence score_), dan merekomendasikan instruksi kerja secara _real-time_.

## Teknologi yang Digunakan

- **Frontend:** Next.js, React, Tailwind CSS, jsPDF (Native Print).
- **Backend:** Laravel , PHP.
- **AI Engine:** Google Gemini 2.5 API.

## Persyaratan Sistem (Prerequisites)

Pastikan komputer Anda sudah terinstal:

- PHP (minimal v8.2) & Composer
- Node.js (minimal v18) & npm
- XAMPP / Laragon (untuk Database MySQL)

## Cara Instalasi & Menjalankan Aplikasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan di lokal Anda.

### 1. Setup Backend (Laravel)

Buka terminal dan arahkan ke folder backend:

```bash
cd backend

** laravel **
- composer install
- cp .env.example .env (buka file .env yang baru dibuat, lalu tambahkan API Key Gemini Anda di baris paling bawah:
GEMINI_API_KEY=masukkan_api_key_anda_disini
(Atur juga koneksi DB_DATABASE, DB_USERNAME, dan DB_PASSWORD sesuai database lokal Anda).)

php artisan key:generate
php artisan migrate
php artisan storage:link

php artisan serve

** Next.js **
cd frontend
npm install
npm run dev

```
