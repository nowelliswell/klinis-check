<?php
/**
 * save_identifikasi.php — API Simpan Data Kepatuhan Identifikasi Pasien
 *
 * Menerima: POST dengan JSON payload atau FormData { data: JSON string }
 * Menyimpan ke tabel `kepatuhan_identifikasi`.
 */

require_once __DIR__ . '/config.php';

// Hanya terima metode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan.']);
    exit;
}

// =====================================================================
// 1. PARSE DATA — mendukung JSON body maupun FormData
// =====================================================================
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (stripos($contentType, 'application/json') !== false) {
    // JSON Payload (sesuai PRD)
    $data = json_decode(file_get_contents('php://input'), true);
} else {
    // FormData fallback (field "data" berisi JSON string)
    $rawData = $_POST['data'] ?? null;
    $data    = $rawData ? json_decode($rawData, true) : null;
}

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Data JSON tidak ditemukan atau tidak valid.']);
    exit;
}

// =====================================================================
// 2. VALIDASI FIELD WAJIB
// =====================================================================
$tanggal  = trim($data['tanggal']  ?? '');
$observer = trim($data['observer'] ?? '');
$petugas  = trim($data['petugas']  ?? '');

if (!$tanggal || !$observer || !$petugas) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Semua field metadata wajib diisi.']);
    exit;
}

// =====================================================================
// 3. MAPPING INDIKATOR KE KOLOM DATABASE
// =====================================================================
// Frontend mengirim value: "YA", "TIDAK", "TIDAK_ADA_INTERVENSI"
// Database ENUM: 'YA', 'TIDAK', 'TIDAK ADA INTERVENSI'
$kolomIndikator = [
    'pemberian_obat',
    'pencabutan_gigi',
    'pemberian_kontrasepsi',
    'imunisasi',
    'kegawatdaruratan',
    'pengambilan_sample',
    'tindakan_lainnya',
];

$mapJawaban = [
    'YA'                    => 'YA',
    'TIDAK'                 => 'TIDAK',
    'TIDAK_ADA_INTERVENSI'  => 'TIDAK ADA INTERVENSI',
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
// 4. INSERT KE DATABASE
// =====================================================================
try {
    $sql = "INSERT INTO kepatuhan_identifikasi
            (tanggal_observasi, nama_observer, nama_petugas,
             pemberian_obat, pencabutan_gigi, pemberian_kontrasepsi,
             imunisasi, kegawatdaruratan, pengambilan_sample, tindakan_lainnya)
            VALUES
            (:tanggal, :observer, :petugas,
             :pemberian_obat, :pencabutan_gigi, :pemberian_kontrasepsi,
             :imunisasi, :kegawatdaruratan, :pengambilan_sample, :tindakan_lainnya)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':tanggal'                => $tanggal,
        ':observer'               => $observer,
        ':petugas'                => $petugas,
        ':pemberian_obat'         => $nilaiKolom['pemberian_obat'],
        ':pencabutan_gigi'        => $nilaiKolom['pencabutan_gigi'],
        ':pemberian_kontrasepsi'  => $nilaiKolom['pemberian_kontrasepsi'],
        ':imunisasi'              => $nilaiKolom['imunisasi'],
        ':kegawatdaruratan'       => $nilaiKolom['kegawatdaruratan'],
        ':pengambilan_sample'     => $nilaiKolom['pengambilan_sample'],
        ':tindakan_lainnya'       => $nilaiKolom['tindakan_lainnya'],
    ]);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Data Identifikasi Pasien berhasil disimpan.',
        'id'      => $pdo->lastInsertId(),
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Gagal menyimpan data: ' . $e->getMessage()]);
}
