<?php
/**
 * reset_password.php — Reset password admin ke default baru
 *
 * POST JSON { username }
 * Mengembalikan password baru yang di-generate.
 */

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Metode tidak diizinkan.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');

if (!$username) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Username wajib diisi.']);
    exit;
}

$stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ? LIMIT 1");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Username tidak ditemukan.']);
    exit;
}

// Generate simple new password
$newPassword = 'reset' . rand(1000, 9999);
$hash = password_hash($newPassword, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
$stmt->execute([$hash, $user['id']]);

echo json_encode([
    'status' => 'success',
    'message' => 'Password berhasil direset.',
    'new_password' => $newPassword,
]);
