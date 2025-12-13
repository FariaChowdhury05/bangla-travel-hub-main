<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin only']);
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $package_id = $input['package_id'] ?? null;
    $destination_id = $input['destination_id'] ?? null;
    $sequence = $input['sequence'] ?? 1;
    if (!$package_id || !$destination_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'package_id and destination_id required']);
        exit();
    }
    $stmt = $conn->prepare("INSERT INTO package_destinations (package_id, destination_id, sequence) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE sequence = VALUES(sequence)");
    $stmt->bind_param('iii', $package_id, $destination_id, $sequence);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $package_id = $input['package_id'] ?? null;
    $destination_id = $input['destination_id'] ?? null;
    if (!$package_id || !$destination_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'package_id and destination_id required']);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM package_destinations WHERE package_id = ? AND destination_id = ?");
    $stmt->bind_param('ii', $package_id, $destination_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
$conn->close();
