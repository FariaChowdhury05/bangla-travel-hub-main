<?php
// api/package_hotel_rooms.php
// Returns rooms pre-mapped for a package + hotel combination
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

$package_id = isset($_GET['package_id']) ? intval($_GET['package_id']) : 0;
$hotel_id = isset($_GET['hotel_id']) ? intval($_GET['hotel_id']) : 0;
if (!$package_id || !$hotel_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'package_id and hotel_id required']);
    exit();
}

$stmt = $conn->prepare("SELECT phr.room_id, r.hotel_id, r.room_number, r.type, r.price_per_night, r.max_guests, r.description
    FROM package_hotel_rooms phr
    JOIN rooms r ON r.id = phr.room_id
    WHERE phr.package_id = ? AND phr.hotel_id = ?");
$stmt->bind_param('ii', $package_id, $hotel_id);
$stmt->execute();
$res = $stmt->get_result();
$rooms = [];
while ($r = $res->fetch_assoc()) {
    $r['room_id'] = isset($r['room_id']) ? intval($r['room_id']) : null;
    $r['hotel_id'] = isset($r['hotel_id']) ? intval($r['hotel_id']) : null;
    $r['price_per_night'] = isset($r['price_per_night']) ? (float) $r['price_per_night'] : 0.0;
    $r['max_guests'] = isset($r['max_guests']) ? intval($r['max_guests']) : 0;
    // normalize to id field expected by frontend
    $r['id'] = $r['room_id'];
    unset($r['room_id']);
    $rooms[] = $r;
}

echo json_encode(['success' => true, 'data' => $rooms]);
exit();
