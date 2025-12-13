<?php
require_once __DIR__ . '/../auth-config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

if (isLoggedIn()) {
    $user = getCurrentUser();
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'isLoggedIn' => true,
        'user' => $user
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'isLoggedIn' => false,
        'user' => null
    ]);
}
