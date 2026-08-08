<?php
/**
 * check_session.php — Cek apakah admin sudah login
 *
 * GET — return user info jika session aktif, atau 401.
 */

require_once __DIR__ . '/config.php';
session_start();

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Belum login.']);
    exit;
}

echo json_encode([
    'status' => 'success',
    'user' => [
        'id'       => $_SESSION['admin_id'],
        'username' => $_SESSION['admin_user'],
        'nama'     => $_SESSION['admin_nama'],
    ],
]);
