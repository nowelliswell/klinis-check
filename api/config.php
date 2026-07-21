<?php
/**
 * config.php — Koneksi Database & Auto-Initialization
 *
 * Skrip ini:
 * 1. Menyiapkan header CORS agar frontend dapat berkomunikasi lintas-domain.
 * 2. Membuat database `db_kepatuhan_klinis` secara otomatis jika belum ada.
 * 3. Membuat 3 tabel (kepatuhan_kkt, kepatuhan_identifikasi, kepatuhan_apd)
 *    secara otomatis jika belum ada.
 * 4. Mengembalikan objek PDO ($pdo) yang siap digunakan oleh skrip API lain.
 */

// =====================================================================
// KONFIGURASI — Ubah sesuai lingkungan Anda
// =====================================================================
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'db_kepatuhan_klinis';

// =====================================================================
// CORS HEADERS
// =====================================================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// =====================================================================
// KONEKSI DATABASE & AUTO-DDL
// =====================================================================
try {
    // 1. Sambung ke server MySQL tanpa database tertentu
    $dsn = "mysql:host={$DB_HOST};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // 2. Buat database jika belum ada
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `{$DB_NAME}`");

    // 3. Auto-create tabel kepatuhan_kkt
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `kepatuhan_kkt` (
            `id`                     INT            AUTO_INCREMENT PRIMARY KEY,
            `timestamp`              TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
            `tanggal_pengumpulan`    DATE           NOT NULL,
            `nama_observer`          VARCHAR(100)   NOT NULL,
            `unit`                   VARCHAR(50)    NOT NULL,
            `nama_petugas`           VARCHAR(100)   NOT NULL,
            `m1_sebelum_kontak`      ENUM('HR','HW','Tidak Dilakukan') NOT NULL,
            `m2_sebelum_tindakan`    ENUM('HR','HW','Tidak Dilakukan') NOT NULL,
            `m3_setelah_cairan`      ENUM('HR','HW','Tidak Dilakukan') NOT NULL,
            `m4_setelah_kontak`      ENUM('HR','HW','Tidak Dilakukan') NOT NULL,
            `m5_setelah_lingkungan`  ENUM('HR','HW','Tidak Dilakukan') NOT NULL,
            `bukti_foto`             VARCHAR(255)   NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // 4. Auto-create tabel kepatuhan_identifikasi
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `kepatuhan_identifikasi` (
            `id`                      INT            AUTO_INCREMENT PRIMARY KEY,
            `timestamp`               TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
            `tanggal_observasi`       DATE           NOT NULL,
            `nama_observer`           VARCHAR(100)   NOT NULL,
            `nama_petugas`            VARCHAR(100)   NOT NULL,
            `pemberian_obat`          ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `pencabutan_gigi`         ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `pemberian_kontrasepsi`   ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `imunisasi`               ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `kegawatdaruratan`        ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `pengambilan_sample`      ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL,
            `tindakan_lainnya`        ENUM('YA','TIDAK','TIDAK ADA INTERVENSI') NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // 5. Auto-create tabel kepatuhan_apd
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `kepatuhan_apd` (
            `id`                   INT            AUTO_INCREMENT PRIMARY KEY,
            `timestamp`            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
            `tanggal_pengumpulan`  DATE           NOT NULL,
            `unit`                 VARCHAR(50)    NOT NULL,
            `nama_observer`        VARCHAR(100)   NOT NULL,
            `nama_petugas`         VARCHAR(100)   NOT NULL,
            `penggunaan_apd`       ENUM('YA','TIDAK') NOT NULL,
            `bukti_foto`           VARCHAR(255)   NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // 6. Auto-create tabel admin_users
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `admin_users` (
            `id`         INT            AUTO_INCREMENT PRIMARY KEY,
            `username`   VARCHAR(50)    NOT NULL UNIQUE,
            `password`   VARCHAR(255)   NOT NULL,
            `nama`       VARCHAR(100)   NOT NULL,
            `created_at` TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // 7. Seed default admin jika belum ada
    $stmtCheck = $pdo->query("SELECT COUNT(*) FROM `admin_users`");
    if ((int) $stmtCheck->fetchColumn() === 0) {
        $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
        $pdo->prepare("INSERT IGNORE INTO `admin_users` (`username`, `password`, `nama`) VALUES (?, ?, ?)")
            ->execute(['admin', $defaultHash, 'Administrator']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Gagal inisialisasi database: ' . $e->getMessage(),
    ]);
    exit;
}

// =====================================================================
// HELPER: Pastikan folder uploads ada
// =====================================================================
$UPLOAD_DIR = __DIR__ . '/uploads/';
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}
