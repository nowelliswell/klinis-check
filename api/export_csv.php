<?php
/**
 * export_csv.php — Export data kepatuhan ke CSV
 *
 * GET ?type=kkt|identifikasi|apd&from=&to=
 */

require_once __DIR__ . '/config.php';
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Belum login.']);
    exit;
}

$type = $_GET['type'] ?? '';
$from = $_GET['from'] ?? '';
$to   = $_GET['to']   ?? '';

$validTypes = ['kkt', 'identifikasi', 'apd'];
if (!in_array($type, $validTypes, true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Parameter type tidak valid. Gunakan: kkt, identifikasi, atau apd.']);
    exit;
}

// Map type ke tabel dan kolom
$tableMap = [
    'kkt' => [
        'table' => 'kepatuhan_kkt',
        'headers' => ['ID', 'Timestamp', 'Tanggal Pengumpulan', 'Nama Observer', 'Unit', 'Nama Petugas',
                       'M1 Sebelum Kontak', 'M2 Sebelum Tindakan', 'M3 Setelah Cairan',
                       'M4 Setelah Kontak', 'M5 Setelah Lingkungan', 'Bukti Foto'],
    ],
    'identifikasi' => [
        'table' => 'kepatuhan_identifikasi',
        'headers' => ['ID', 'Timestamp', 'Tanggal Observasi', 'Nama Observer', 'Nama Petugas',
                       'Pemberian Obat', 'Pencabutan Gigi', 'Pemberian Kontrasepsi',
                       'Imunisasi', 'Kegawatdaruratan', 'Pengambilan Sample', 'Tindakan Lainnya'],
    ],
    'apd' => [
        'table' => 'kepatuhan_apd',
        'headers' => ['ID', 'Timestamp', 'Tanggal Pengumpulan', 'Unit', 'Nama Observer',
                       'Nama Petugas', 'Penggunaan APD', 'Bukti Foto'],
    ],
];

$table = $tableMap[$type]['table'];
$headers = $tableMap[$type]['headers'];

// Build WHERE
$where = [];
$params = [];
if ($from) {
    $where[] = "DATE(timestamp) >= ?";
    $params[] = $from;
}
if ($to) {
    $where[] = "DATE(timestamp) <= ?";
    $params[] = $to;
}
$whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Fetch data
$stmt = $pdo->prepare("SELECT * FROM `$table` $whereSQL ORDER BY timestamp DESC");
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Output CSV
$filename = "export_{$type}_" . date('Y-m-d_His') . ".csv";

// Override JSON content-type from config.php
header('Content-Type: text/csv; charset=utf-8');
header("Content-Disposition: attachment; filename=\"$filename\"");

$out = fopen('php://output', 'w');

// BOM untuk Excel UTF-8
fwrite($out, "\xEF\xBB\xBF");

// Header row
fputcsv($out, $headers);

// Data rows
foreach ($rows as $row) {
    fputcsv($out, array_values($row));
}

fclose($out);
exit;
