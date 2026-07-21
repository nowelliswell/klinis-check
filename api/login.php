<?php
/**
 * login.php — API Login Admin
 *
 * POST JSON { username, password }
 * Memulai PHP session dan menyimpan data admin.
 */

require_once __DIR__ . '/config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan.']);
    exit;
}

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username dan password wajib diisi.']);
    exit;
}

// Cari user di database
$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? LIMIT 1");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Username atau password salah.']);
    exit;
}

// Set session
$_SESSION['admin_id']   = $user['id'];
$_SESSION['admin_user'] = $user['username'];
$_SESSION['admin_nama'] = $user['nama'];

echo json_encode([
    'status' => 'success',
    'message' => 'Login berhasil.',
    'user' => [
        'id'       => $user['id'],
        'username' => $user['username'],
        'nama'     => $user['nama'],
    ],
]);
