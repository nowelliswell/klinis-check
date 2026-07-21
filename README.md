# Sistem Monitoring Kepatuhan Klinis (Klinis Check)

Klinis Check adalah sistem pencatatan dan pelaporan kepatuhan klinis rumah sakit atau puskesmas berbasis web. Sistem ini memungkinkan para observer klinis untuk melakukan observasi secara real-time melalui form digital dan merekam hasil kepatuhan secara otomatis.

Aplikasi ini dibagi menjadi dua bagian utama:
1. **Frontend (Observer)**: Antarmuka modern untuk input data observasi (Kepatuhan Kebersihan Tangan / KKT, Identifikasi Pasien, dan Alat Pelindung Diri / APD).
2. **Admin Panel**: Dashboard khusus untuk meninjau data yang dikirimkan, melihat statistik kepatuhan (chart), dan mengekspor laporan ke format CSV.

---

## 🛠️ Tech Stack
- **Frontend**: React, TanStack Start (File-based routing), Tailwind CSS, TypeScript, Recharts (untuk dashboard), Shadcn UI.
- **Backend**: PHP 8 (Native), MySQL, PDO.
- **Tools**: Vite, npm.

---

## 🚀 Fitur Utama

### 1. Form Observasi Klinis
- **KKT (Kepatuhan Kebersihan Tangan)**: Pencatatan *5 moments of hand hygiene* dengan bukti foto.
- **Identifikasi Pasien**: Pencatatan prosedur identifikasi pasien (Pemberian obat, cabut gigi, imunisasi, dll).
- **Kepatuhan APD**: Observasi kelengkapan APD dengan bukti foto.

### 2. Admin Panel & Dashboard
- Dilengkapi sistem login dengan otentikasi PHP Session + password hash (bcrypt).
- **Dashboard Statistik**: Terdapat rangkuman total observasi hari/bulan ini, grafik tren observasi 30 hari terakhir, dan distribusi kepatuhan berbentuk pie chart.
- **Manajemen Data**: Tabel yang responsif dengan fitur filter berdasarkan tanggal, unit, atau pencarian nama observer.
- **Export Data**: Ekspor hasil observasi ke file CSV dengan format yang rapi untuk diolah lebih lanjut (misalnya di Excel).
- **Mobile Friendly**: Seluruh antarmuka admin dan observer sudah mendukung tampilan dari perangkat mobile (HP).

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

Aplikasi ini menggunakan perpaduan antara **React (Node.js)** untuk antarmuka pengguna, dan **PHP/MySQL (XAMPP)** untuk backend server dan database.

### Prasyarat
- [Node.js](https://nodejs.org) (v18+)
- [XAMPP](https://www.apachefriends.org) (Apache & MySQL)

### Langkah 1: Setup Backend (PHP & MySQL)
1. Buka aplikasi **XAMPP Control Panel**.
2. Start layanan **Apache** dan **MySQL**.
3. Copy folder `api` dari proyek ini ke dalam folder `htdocs` milik XAMPP.
   - Misalnya: `C:\xampp\htdocs\api\`
   - *Catatan: Pastikan semua file seperti `config.php`, `login.php`, `get_stats.php`, dll, tersalin dengan benar.*
4. Buka phpMyAdmin (http://localhost/phpmyadmin) dan pastikan database bernama `db_kepatuhan_klinis` sudah ada atau akan terbuat otomatis saat API diakses.
5. Tabel akan otomatis di-*generate* ketika Anda membuka halaman admin/form pertama kali. Data admin default juga akan dibuat otomatis:
   - **Username Admin**: `admin`
   - **Password Admin**: `admin123`

### Langkah 2: Setup Frontend (React)
1. Buka terminal (command prompt / PowerShell) di root direktori proyek `klinis-check`.
2. Jalankan perintah untuk menginstal dependencies:
   ```bash
   npm install
   ```
3. Jalankan server *development*:
   ```bash
   npm run dev
   ```
4. Aplikasi akan berjalan, biasanya di `http://localhost:5173` atau port lain sesuai yang tertera di terminal.

### Langkah 3: Menggunakan Aplikasi
- Buka URL dari langkah 2 di browser Anda untuk masuk ke halaman utama Observer.
- Untuk masuk ke **Admin Panel**, klik tombol **"Panel Admin"** di dashboard atau buka `http://localhost:5173/login`. Gunakan username `admin` dan password `admin123` untuk login.

---

## 📝 Catatan Penting
- Saat ini sistem menggunakan konfigurasi API yang mengarah ke `http://localhost/api`. Jika Anda menggunakan konfigurasi host atau port XAMPP yang berbeda (seperti port 8080), Anda perlu menyesuaikan `API_BASE` di frontend (`src/lib/submit.ts` dan `src/lib/admin-api.ts`) dan memastikan setting CORS di `config.php` telah mengizinkan origin yang sesuai.
- Segera ganti password default admin demi keamanan melalui modifikasi database.
