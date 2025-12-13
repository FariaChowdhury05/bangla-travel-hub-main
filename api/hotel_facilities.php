<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $hotel_id = isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : null;
    if (!$hotel_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'hotel_id required']);
        exit();
    }
    $stmt = $conn->prepare("SELECT f.id, f.name, f.description, hf.notes FROM hotel_facilities hf JOIN facilities f ON hf.facility_id = f.id WHERE hf.hotel_id = ? ORDER BY f.name ASC");
    $stmt->bind_param('i', $hotel_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc())
        $rows[] = $r;
    echo json_encode($rows);
    exit();
}

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Only admins can modify hotel facilities']);
    exit();
}

if ($method === 'POST') {
    $input = $_POST;
    if (empty($input))
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $hotel_id = isset($input['hotel_id']) ? intval($input['hotel_id']) : null;
    $facility_id = isset($input['facility_id']) ? intval($input['facility_id']) : null;
    $notes = isset($input['notes']) ? $conn->real_escape_string(trim($input['notes'])) : null;
    if (!$hotel_id || !$facility_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'hotel_id and facility_id required']);
        exit();
    }
    $stmt = $conn->prepare("INSERT INTO hotel_facilities (hotel_id, facility_id, notes) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE notes = VALUES(notes)");
    $stmt->bind_param('iis', $hotel_id, $facility_id, $notes);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $hotel_id = isset($input['hotel_id']) ? intval($input['hotel_id']) : (isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : null);
    $facility_id = isset($input['facility_id']) ? intval($input['facility_id']) : (isset($_GET['facility_id']) ? intval($_GET['facility_id']) : null);
    if (!$hotel_id || !$facility_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'hotel_id and facility_id required']);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM hotel_facilities WHERE hotel_id = ? AND facility_id = ?");
    $stmt->bind_param('ii', $hotel_id, $facility_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $hotel_id = isset($input['hotel_id']) ? intval($input['hotel_id']) : null;
    $facility_id = isset($input['facility_id']) ? intval($input['facility_id']) : null;
    $notes = isset($input['notes']) ? $conn->real_escape_string(trim($input['notes'])) : null;
    if (!$hotel_id || !$facility_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'hotel_id and facility_id required']);
        exit();
    }
    $stmt = $conn->prepare("UPDATE hotel_facilities SET notes = ? WHERE hotel_id = ? AND facility_id = ?");
    $stmt->bind_param('sii', $notes, $hotel_id, $facility_id);
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
