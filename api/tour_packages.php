<?php
// api/tour_packages.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

/**
 * Safe helper for prepare
 */
function safe_prepare($conn, $sql)
{
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
        exit();
    }
    return $stmt;
}

/**
 * GET -> list all packages with destinations and booking_count
 */
if ($method === 'GET') {
    // Query packages
    $sql = "SELECT p.*, 
            (SELECT COUNT(*) FROM bookings WHERE package_id = p.id) AS booking_count
            FROM tour_packages p
            ORDER BY p.created_at DESC";
    $result = $conn->query($sql);
    if ($result === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $conn->error]);
        exit();
    }

    $packages = [];
    while ($row = $result->fetch_assoc()) {
        $row['price'] = (float) $row['price'];
        $row['booking_count'] = (int) $row['booking_count'];

        // Fetch destinations for this package
        $dest_stmt = safe_prepare($conn, "
            SELECT d.id, d.name, d.description, pd.sequence
            FROM package_destinations pd
            JOIN destinations d ON d.id = pd.destination_id
            WHERE pd.package_id = ?
            ORDER BY pd.sequence ASC
        ");
        $dest_stmt->bind_param('i', $row['id']);
        $dest_stmt->execute();
        $dest_result = $dest_stmt->get_result();

        $destinations = [];
        while ($dest_row = $dest_result->fetch_assoc()) {
            $dest_row['id'] = (int) $dest_row['id'];
            $dest_row['sequence'] = (int) $dest_row['sequence'];
            $destinations[] = $dest_row;
        }
        $row['destinations'] = $destinations;

        $packages[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $packages]);
    exit();
}

/**
 * Non-GET below are admin-only
 */
if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin only']);
    exit();
}

/**
 * POST -> create package
 */
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name is required']);
        exit();
    }

    $name = $input['name'];
    $desc = $input['description'] ?? null;
    $price = isset($input['price']) ? floatval($input['price']) : 0.00;
    $duration = isset($input['duration_days']) ? intval($input['duration_days']) : 1;
    $image_url = $input['image_url'] ?? null;

    $stmt = safe_prepare($conn, "INSERT INTO tour_packages (name, description, price, duration_days, image_url) VALUES (?, ?, ?, ?, ?)");
    // FIXED: Changed from 'ssdiss' to 'ssdis' (5 parameters, not 6)
    $stmt->bind_param('ssdis', $name, $desc, $price, $duration, $image_url);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

/**
 * PATCH -> update package
 */
if ($method === 'PATCH') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input)) {
        echo json_encode(['success' => false, 'error' => 'No update data']);
        exit();
    }

    $fields = [];
    $types = '';
    $params = [];

    $map = ['name' => 's', 'description' => 's', 'price' => 'd', 'duration_days' => 'i', 'image_url' => 's'];
    foreach ($map as $field => $t) {
        if (array_key_exists($field, $input)) {
            $fields[] = "$field = ?";
            $types .= $t;
            $params[] = $input[$field];
        }
    }

    if (!count($fields)) {
        echo json_encode(['success' => false, 'error' => 'Nothing to update']);
        exit();
    }

    $sql = "UPDATE tour_packages SET " . implode(', ', $fields) . " WHERE id = ?";
    $types .= 'i';
    $params[] = $id;

    $stmt = safe_prepare($conn, $sql);
    // dynamic bind
    $stmt->bind_param($types, ...$params);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

/**
 * DELETE -> delete package
 */
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit();
    }

    $stmt = safe_prepare($conn, "DELETE FROM tour_packages WHERE id = ?");
    $stmt->bind_param('i', $id);
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