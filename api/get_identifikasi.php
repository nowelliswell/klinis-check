<?php
/**
 * get_identifikasi.php — API Ambil Data Kepatuhan Identifikasi Pasien
 *
 * GET ?page=1&limit=20&from=&to=&search=
 */

require_once __DIR__ . '/config.php';
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Belum login.']);
    exit;
}

$page   = max(1, (int) ($_GET['page'] ?? 1));
$limit  = max(1, min(100, (int) ($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$from   = $_GET['from']   ?? '';
$to     = $_GET['to']     ?? '';
$search = trim($_GET['search'] ?? '');

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
if ($search) {
    $where[] = "(nama_observer LIKE ? OR nama_petugas LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';

// Total count
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_identifikasi $whereSQL");
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

// Fetch data
$dataStmt = $pdo->prepare("SELECT * FROM kepatuhan_identifikasi $whereSQL ORDER BY timestamp DESC LIMIT $limit OFFSET $offset");
$dataStmt->execute($params);
$data = $dataStmt->fetchAll();

echo json_encode([
    'status' => 'success',
    'data'   => $data,
    'total'  => $total,
    'page'   => $page,
    'limit'  => $limit,
    'pages'  => (int) ceil($total / $limit),
]);
