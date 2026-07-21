<?php
/**
 * get_stats.php — Statistik ringkasan untuk dashboard admin
 *
 * GET — return total records, distribusi jawaban, trend harian.
 */

require_once __DIR__ . '/config.php';
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Belum login.']);
    exit;
}

$today = date('Y-m-d');
$monthStart = date('Y-m-01');

// =====================================================================
// 1. TOTAL RECORDS PER TABEL
// =====================================================================
$totalKkt = (int) $pdo->query("SELECT COUNT(*) FROM kepatuhan_kkt")->fetchColumn();
$totalIdentifikasi = (int) $pdo->query("SELECT COUNT(*) FROM kepatuhan_identifikasi")->fetchColumn();
$totalApd = (int) $pdo->query("SELECT COUNT(*) FROM kepatuhan_apd")->fetchColumn();

// Hari ini
$todayKkt = (function() use ($pdo, $today) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_kkt WHERE DATE(timestamp) = ?");
    $s->execute([$today]); return (int) $s->fetchColumn();
})();
$todayIdentifikasi = (function() use ($pdo, $today) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_identifikasi WHERE DATE(timestamp) = ?");
    $s->execute([$today]); return (int) $s->fetchColumn();
})();
$todayApd = (function() use ($pdo, $today) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_apd WHERE DATE(timestamp) = ?");
    $s->execute([$today]); return (int) $s->fetchColumn();
})();

// Bulan ini
$monthKkt = (function() use ($pdo, $monthStart) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_kkt WHERE DATE(timestamp) >= ?");
    $s->execute([$monthStart]); return (int) $s->fetchColumn();
})();
$monthIdentifikasi = (function() use ($pdo, $monthStart) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_identifikasi WHERE DATE(timestamp) >= ?");
    $s->execute([$monthStart]); return (int) $s->fetchColumn();
})();
$monthApd = (function() use ($pdo, $monthStart) {
    $s = $pdo->prepare("SELECT COUNT(*) FROM kepatuhan_apd WHERE DATE(timestamp) >= ?");
    $s->execute([$monthStart]); return (int) $s->fetchColumn();
})();

// =====================================================================
// 2. DISTRIBUSI JAWABAN KKT (5 moments gabungan)
// =====================================================================
$kktDist = ['HR' => 0, 'HW' => 0, 'Tidak Dilakukan' => 0];
$moments = ['m1_sebelum_kontak','m2_sebelum_tindakan','m3_setelah_cairan','m4_setelah_kontak','m5_setelah_lingkungan'];
foreach ($moments as $m) {
    $rows = $pdo->query("SELECT `$m` as val, COUNT(*) as cnt FROM kepatuhan_kkt GROUP BY `$m`")->fetchAll();
    foreach ($rows as $r) {
        if (isset($kktDist[$r['val']])) $kktDist[$r['val']] += (int) $r['cnt'];
    }
}

// Distribusi APD
$apdDist = ['YA' => 0, 'TIDAK' => 0];
$rows = $pdo->query("SELECT penggunaan_apd as val, COUNT(*) as cnt FROM kepatuhan_apd GROUP BY penggunaan_apd")->fetchAll();
foreach ($rows as $r) {
    if (isset($apdDist[$r['val']])) $apdDist[$r['val']] += (int) $r['cnt'];
}

// Distribusi Identifikasi (7 indikator gabungan)
$idDist = ['YA' => 0, 'TIDAK' => 0, 'TIDAK ADA INTERVENSI' => 0];
$idCols = ['pemberian_obat','pencabutan_gigi','pemberian_kontrasepsi','imunisasi','kegawatdaruratan','pengambilan_sample','tindakan_lainnya'];
foreach ($idCols as $col) {
    $rows = $pdo->query("SELECT `$col` as val, COUNT(*) as cnt FROM kepatuhan_identifikasi GROUP BY `$col`")->fetchAll();
    foreach ($rows as $r) {
        if (isset($idDist[$r['val']])) $idDist[$r['val']] += (int) $r['cnt'];
    }
}

// =====================================================================
// 3. TREND 30 HARI TERAKHIR
// =====================================================================
$thirtyDaysAgo = date('Y-m-d', strtotime('-30 days'));
$trend = [];

$trendKkt = $pdo->prepare("SELECT DATE(timestamp) as tgl, COUNT(*) as cnt FROM kepatuhan_kkt WHERE DATE(timestamp) >= ? GROUP BY DATE(timestamp)");
$trendKkt->execute([$thirtyDaysAgo]);
foreach ($trendKkt->fetchAll() as $r) $trend[$r['tgl']]['kkt'] = (int) $r['cnt'];

$trendId = $pdo->prepare("SELECT DATE(timestamp) as tgl, COUNT(*) as cnt FROM kepatuhan_identifikasi WHERE DATE(timestamp) >= ? GROUP BY DATE(timestamp)");
$trendId->execute([$thirtyDaysAgo]);
foreach ($trendId->fetchAll() as $r) $trend[$r['tgl']]['identifikasi'] = (int) $r['cnt'];

$trendApd = $pdo->prepare("SELECT DATE(timestamp) as tgl, COUNT(*) as cnt FROM kepatuhan_apd WHERE DATE(timestamp) >= ? GROUP BY DATE(timestamp)");
$trendApd->execute([$thirtyDaysAgo]);
foreach ($trendApd->fetchAll() as $r) $trend[$r['tgl']]['apd'] = (int) $r['cnt'];

// Fill 30 hari
$trendArray = [];
for ($i = 29; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $trendArray[] = [
        'tanggal'       => $d,
        'kkt'           => $trend[$d]['kkt'] ?? 0,
        'identifikasi'  => $trend[$d]['identifikasi'] ?? 0,
        'apd'           => $trend[$d]['apd'] ?? 0,
    ];
}

// =====================================================================
// OUTPUT
// =====================================================================
echo json_encode([
    'status' => 'success',
    'totals' => [
        'kkt'           => $totalKkt,
        'identifikasi'  => $totalIdentifikasi,
        'apd'           => $totalApd,
        'all'           => $totalKkt + $totalIdentifikasi + $totalApd,
    ],
    'today' => [
        'kkt'           => $todayKkt,
        'identifikasi'  => $todayIdentifikasi,
        'apd'           => $todayApd,
        'all'           => $todayKkt + $todayIdentifikasi + $todayApd,
    ],
    'month' => [
        'kkt'           => $monthKkt,
        'identifikasi'  => $monthIdentifikasi,
        'apd'           => $monthApd,
        'all'           => $monthKkt + $monthIdentifikasi + $monthApd,
    ],
    'distribution' => [
        'kkt'           => $kktDist,
        'identifikasi'  => $idDist,
        'apd'           => $apdDist,
    ],
    'trend' => $trendArray,
]);
