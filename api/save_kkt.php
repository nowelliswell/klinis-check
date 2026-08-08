<?php
/**
 * save_kkt.php — API Simpan Data Kepatuhan Kebersihan Tangan
 *
 * Menerima: POST FormData { data: JSON string, foto: File }
 * Menyimpan ke tabel `kepatuhan_kkt`.
 */

require_once __DIR__ . '/config.php';

// Hanya terima metode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan.']);
    exit;
}

// =====================================================================
// 1. PARSE DATA
// =====================================================================
$rawData = $_POST['data'] ?? null;
if (!$rawData) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Field "data" tidak ditemukan.']);
    exit;
}

$data = json_decode($rawData, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Format JSON pada field "data" tidak valid.']);
    exit;
}

// =====================================================================
// 2. VALIDASI FIELD WAJIB
// =====================================================================
$tanggal  = trim($data['tanggal']  ?? '');
$observer = trim($data['observer'] ?? '');
$unit     = trim($data['unit']     ?? '');
$petugas  = trim($data['petugas']  ?? '');

if (!$tanggal || !$observer || !$unit || !$petugas) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Semua field metadata wajib diisi.']);
    exit;
}

// =====================================================================
// 3. MAPPING INDIKATOR KE KOLOM DATABASE
// =====================================================================
// Frontend mengirim array indikator dengan value: "HR", "HW", "TIDAK"
// Database ENUM: 'HR', 'HW', 'Tidak Dilakukan'
$kolomIndikator = [
    'm1_sebelum_kontak',
    'm2_sebelum_tindakan',
    'm3_setelah_cairan',
    'm4_setelah_kontak',
    'm5_setelah_lingkungan',
];

$mapJawaban = [
    'HR'    => 'HR',
    'HW'    => 'HW',
    'TIDAK' => 'Tidak Dilakukan',
];

$indikatorData = $data['indikator'] ?? [];
$nilaiKolom = [];

foreach ($kolomIndikator as $idx => $kolom) {
    $jawaban = $indikatorData[$idx]['jawaban'] ?? null;
    $mapped  = $mapJawaban[$jawaban] ?? null;
    if (!$mapped) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Jawaban indikator ke-" . ($idx + 1) . " tidak valid."]);
        exit;
    }
    $nilaiKolom[$kolom] = $mapped;
}

// =====================================================================
// 4. UPLOAD FOTO
// =====================================================================
$namaFoto = null;
if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $ext      = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
    $namaFoto = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $_FILES['foto']['name']);
    $target   = $UPLOAD_DIR . $namaFoto;

    if (!move_uploaded_file($_FILES['foto']['tmp_name'], $target)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan file foto.']);
        exit;
    }
}

// =====================================================================
// 5. INSERT KE DATABASE
// =====================================================================
try {
    $sql = "INSERT INTO kepatuhan_kkt
            (tanggal_pengumpulan, nama_observer, unit, nama_petugas,
             m1_sebelum_kontak, m2_sebelum_tindakan, m3_setelah_cairan,
             m4_setelah_kontak, m5_setelah_lingkungan, bukti_foto)
            VALUES
            (:tanggal, :observer, :unit, :petugas,
             :m1, :m2, :m3, :m4, :m5, :foto)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':tanggal'  => $tanggal,
        ':observer' => $observer,
        ':unit'     => $unit,
        ':petugas'  => $petugas,
        ':m1'       => $nilaiKolom['m1_sebelum_kontak'],
        ':m2'       => $nilaiKolom['m2_sebelum_tindakan'],
        ':m3'       => $nilaiKolom['m3_setelah_cairan'],
        ':m4'       => $nilaiKolom['m4_setelah_kontak'],
        ':m5'       => $nilaiKolom['m5_setelah_lingkungan'],
        ':foto'     => $namaFoto,
    ]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Data KKT berhasil disimpan.',
        'id'      => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan data: ' . $e->getMessage()]);
}
