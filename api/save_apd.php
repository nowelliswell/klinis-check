<?php
/**
 * save_apd.php — API Simpan Data Kepatuhan APD
 *
 * Menerima: POST FormData { data: JSON string, foto: File }
 * Menyimpan ke tabel `kepatuhan_apd`.
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
$unit     = trim($data['unit']     ?? '');
$observer = trim($data['observer'] ?? '');
$petugas  = trim($data['petugas']  ?? '');

if (!$tanggal || !$unit || !$observer || !$petugas) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Semua field metadata wajib diisi.']);
    exit;
}

// =====================================================================
// 3. MAPPING INDIKATOR
// =====================================================================
// Frontend mengirim value: "YA", "TIDAK"
// Database ENUM: 'YA', 'TIDAK' — langsung cocok
$indikatorData = $data['indikator'] ?? [];
$jawaban = $indikatorData[0]['jawaban'] ?? null;

$validJawaban = ['YA', 'TIDAK'];
if (!$jawaban || !in_array($jawaban, $validJawaban, true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Jawaban indikator APD tidak valid.']);
    exit;
}

// =====================================================================
// 4. UPLOAD FOTO
// =====================================================================
$namaFoto = null;
if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
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
    $sql = "INSERT INTO kepatuhan_apd
            (tanggal_pengumpulan, unit, nama_observer, nama_petugas,
             penggunaan_apd, bukti_foto)
            VALUES
            (:tanggal, :unit, :observer, :petugas,
             :penggunaan_apd, :foto)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':tanggal'        => $tanggal,
        ':unit'           => $unit,
        ':observer'       => $observer,
        ':petugas'        => $petugas,
        ':penggunaan_apd' => $jawaban,
        ':foto'           => $namaFoto,
    ]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Data APD berhasil disimpan.',
        'id'      => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan data: ' . $e->getMessage()]);
}
