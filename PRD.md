# PRODUCT REQUIREMENT DOCUMENT (PRD)

## 1. Ringkasan Proyek (Project Overview)
* **Nama Produk:** Sistem Monitoring Kepatuhan Klinis Berbasis Web
* **Target Pengguna:** Tim Mutu / Staf Puskesmas & Rumah Sakit (Observer Lapangan)
* **Tujuan Utama:** Menggantikan Google Forms menjadi aplikasi web internal berbasis database relasional (MySQL). Sistem dirancang dengan pendekatan *mobile-first* (optimal untuk smartphone) agar memudahkan input data secara real-time saat audit keliling fasilitas kesehatan. Sistem juga dilengkapi fitur otomatisasi pembuatan database (Auto-DDL).

---

## 2. Fitur Utama & Alur Pengguna (Key Features & User Flow)
1. **Halaman Utama (Dashboard Menu):** 
   * Satu gerbang masuk berupa menu navigasi bersih berisi 3 pilihan form utama.
2. **Form Input Optimalisasi Mobile:**
   * Penggantian komponen input kecil (seperti radio button standar) menjadi tombol seleksi besar (*Toggle Group / Button Cards*) agar mudah ditekan dengan jempol di layar HP.
3. **Integrasi Kamera Native:**
   * Fungsi upload gambar yang langsung memicu kamera belakang smartphone secara otomatis menggunakan atribut `capture="environment"`.
4. **Auto-Initialization Backend:**
   * Skrip backend yang otomatis mendeteksi, membuat database, dan menyusun tabel-tabel MySQL jika sistem dijalankan untuk pertama kali (tanpa perlu impor manual via phpMyAdmin).

---

## 3. Persyaratan Fungsional (Functional Requirements)

### 3.1 Halaman Utama / Dashboard
* **UI:** 3 Card navigasi utama berlabel:
  * **Form KKT** (Kepatuhan Kebersihan Tangan)
  * **Form Kepatuhan Identifikasi Pasien**
  * **Form Kepatuhan APD**
* **Perilaku:** Mengetuk salah satu card akan mengarahkan user ke halaman form terkait tanpa *reload* halaman yang berat.

### 3.2 Spesifikasi Teknis Input Form

#### A. Form Kepatuhan Kebersihan Tangan (KKT)
* **Kolom Metadata:**
  * Tanggal Pengumpulan Data (Tipe: Date, default: Hari Ini)
  * Nama Observer (Tipe: Text)
  * Unit / Ruangan (Dropdown Opsi: `Ruang Tindakan`, `Apotek`, `Administrasi`)
  * Nama Petugas yang di Observasi (Tipe: Text)
* **Indikator Penilaian (5 Moments):**
  1. Sebelum kontak dengan pengguna layanan/spesimen
  2. Sebelum Tindakan Aseptik
  3. Setelah kena cairan tubuh pengguna layanan/spesimen
  4. Setelah kontak dengan pengguna layanan/spesimen
  5. Setelah kontak lingkungan
* **Opsi Jawaban (Button Group):** `HR` (Handrub), `HW` (Handwash), atau `Tidak Dilakukan`
* **Lampiran:** Input File Foto Bukti Kepatuhan (Membuka Kamera Belakang HP)

#### B. Form Kepatuhan Identifikasi Pasien
* **Kolom Metadata:**
  * Tanggal Observasi (Tipe: Date, default: Hari Ini)
  * Nama Observer (Tipe: Text)
  * Nama Petugas yang di Observasi (Tipe: Text)
* **Indikator Penilaian (Jenis Tindakan):**
  1. Pemberian obat
  2. Tindakan pencabutan gigi
  3. Tindakan pemberian kontrasepsi
  4. Tindakan imunisasi
  5. Tindakan kegawat daruratan
  6. Prosedur pengambilan sample
  7. Tindakan Lainnya
* **Opsi Jawaban (Button Group):** `YA`, `TIDAK`, atau `TIDAK ADA INTERVENSI`

#### C. Form Kepatuhan APD
* **Kolom Metadata:**
  * Tanggal Pengumpulan Data (Tipe: Date, default: Hari Ini)
  * Unit / Ruangan (Dropdown Opsi: `Ruang Tindakan`, `Apotek`, `Administrasi`)
  * Nama Observer (Tipe: Text)
  * Nama Petugas yang di Observasi (Tipe: Text)
* **Indikator Penilaian:** Penggunaan APD Lengkap Sesuai Indikasi
* **Opsi Jawaban (Button Group):** `YA` atau `TIDAK`
* **Lampiran:** Input File Foto Bukti Kepatuhan (Membuka Kamera Belakang HP)

---

## 4. Arsitektur Data & Spesifikasi Database (MySQL)

Database menggunakan nama `db_kepatuhan_klinis`. Developer harus menerapkan skrip **Auto-Create Database & Tables** di bagian inisialisasi koneksi PHP (`config.php`) dengan struktur tabel berikut:

### 4.1 Tabel `kepatuhan_kkt`
| Nama Kolom | Tipe Data | Atribut / Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `timestamp` | TIMESTAMP | Default: `CURRENT_TIMESTAMP` |
| `tanggal_pengumpulan`| DATE | Not Null |
| `nama_observer` | VARCHAR(100) | Not Null |
| `unit` | VARCHAR(50) | Not Null |
| `nama_petugas` | VARCHAR(100) | Not Null |
| `m1_sebelum_kontak` | ENUM | Opsi: 'HR', 'HW', 'Tidak Dilakukan' |
| `m2_sebelum_tindakan`| ENUM | Opsi: 'HR', 'HW', 'Tidak Dilakukan' |
| `m3_setelah_cairan` | ENUM | Opsi: 'HR', 'HW', 'Tidak Dilakukan' |
| `m4_setelah_kontak` | ENUM | Opsi: 'HR', 'HW', 'Tidak Dilakukan' |
| `m5_setelah_lingkungan`| ENUM | Opsi: 'HR', 'HW', 'Tidak Dilakukan' |
| `bukti_foto` | VARCHAR(255) | Nullable (Menyimpan nama file/path gambar) |

### 4.2 Tabel `kepatuhan_identifikasi`
| Nama Kolom | Tipe Data | Atribut / Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `timestamp` | TIMESTAMP | Default: `CURRENT_TIMESTAMP` |
| `tanggal_observasi` | DATE | Not Null |
| `nama_observer` | VARCHAR(100) | Not Null |
| `nama_petugas` | VARCHAR(100) | Not Null |
| `pemberian_obat` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `pencabutan_gigi` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `pemberian_kontrasepsi`| ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `imunisasi` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `kegawatdaruratan` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `pengambilan_sample` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |
| `tindakan_lainnya` | ENUM | Opsi: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI' |

### 4.3 Tabel `kepatuhan_apd`
| Nama Kolom | Tipe Data | Atribut / Keterangan |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `timestamp` | TIMESTAMP | Default: `CURRENT_TIMESTAMP` |
| `tanggal_pengumpulan`| DATE | Not Null |
| `unit` | VARCHAR(50) | Not Null |
| `nama_observer` | VARCHAR(100) | Not Null |
| `nama_petugas` | VARCHAR(100) | Not Null |
| `penggunaan_apd` | ENUM | Opsi: 'YA', 'TIDAK' |
| `bukti_foto` | VARCHAR(255) | Nullable (Menyimpan nama file/path gambar) |

---

## 5. Spesifikasi Integrasi API (Frontend ke Backend)

Developer Antigravity perlu memastikan komunikasi data antara UI (React/Vite dari Loveable) dan Skrip API PHP berjalan mulus dengan ketentuan berikut:

1. **Metode Payload:**
   * Untuk form **Identifikasi Pasien** (tanpa media): Data dikirim dalam format **JSON Payload** via metode `POST`.
   * Untuk form **KKT & APD** (dengan media foto): Data wajib dikirim menggunakan objek **`FormData`** via metode `POST` untuk mengakomodasi pengiriman file biner gambar.
2. **CORS & Headers:** 
   * Backend wajib menyertakan header `Access-Control-Allow-Origin: *` agar tidak terkena blokir kebijakan CORS browser saat tahap pengujian/pengembangan lintas domain.
3. **Manajemen File Gambar:**
   * Skrip API penerima file foto harus melakukan *rename* nama file secara unik (disarankan menggunakan kombinasi fungsi `time()` + nama asli file).
   * File fisik disimpan di dalam direktori internal server bernama `/uploads/` dan sistem backend wajib memeriksa keberadaan direktori tersebut secara dinamis (`mkdir` otomatis jika belum ada).