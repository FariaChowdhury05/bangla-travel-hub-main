<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch rooms, optionally filter by hotel_id
    $hotel_id = isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : null;

    if ($hotel_id) {
        $stmt = $conn->prepare("SELECT id, hotel_id, room_number, type, price_per_night, max_guests, description, created_at FROM rooms WHERE hotel_id = ? ORDER BY room_number ASC");
        $stmt->bind_param('i', $hotel_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $stmt = $conn->prepare("SELECT id, hotel_id, room_number, type, price_per_night, max_guests, description, created_at FROM rooms ORDER BY hotel_id, room_number ASC");
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $rooms = [];
    while ($row = $result->fetch_assoc()) {
        $rooms[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $rooms]);
    exit();

} elseif ($method === 'POST') {
    // Create room - admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can create rooms']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['hotel_id']) || !isset($input['room_number']) || !isset($input['price_per_night'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields: hotel_id, room_number, price_per_night']);
        exit();
    }

    $hotel_id = intval($input['hotel_id']);
    $room_number = $conn->real_escape_string(trim($input['room_number']));
    $type = isset($input['type']) ? $conn->real_escape_string(trim($input['type'])) : 'standard';
    $price_per_night = floatval($input['price_per_night']);
    $max_guests = isset($input['max_guests']) ? intval($input['max_guests']) : 2;
    $description = isset($input['description']) ? $conn->real_escape_string(trim($input['description'])) : null;

    $stmt = $conn->prepare("INSERT INTO rooms (hotel_id, room_number, type, price_per_night, max_guests, description) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('issdis', $hotel_id, $room_number, $type, $price_per_night, $max_guests, $description);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Room created', 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();

} elseif ($method === 'DELETE') {
    // Delete room - admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can delete rooms']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Room ID required']);
        exit();
    }

    $id = intval($input['id']);
    $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Room deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
