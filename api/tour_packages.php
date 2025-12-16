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
        // Normalize duration to integer; if not set and dates exist compute it
        $row['duration_days'] = isset($row['duration_days']) ? intval($row['duration_days']) : 1;
        if (($row['duration_days'] <= 0 || $row['duration_days'] === 1) && !empty($row['start_date']) && !empty($row['end_date'])) {
            $sd = strtotime($row['start_date']);
            $ed = strtotime($row['end_date']);
            if ($sd && $ed && $ed >= $sd) {
                $row['duration_days'] = intval(floor(($ed - $sd) / 86400)) + 1;
            }
        }

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

        // Normalize meal and transport fields
        $row['breakfast'] = isset($row['breakfast']) ? (bool) intval($row['breakfast']) : false;
        $row['lunch'] = isset($row['lunch']) ? (bool) intval($row['lunch']) : false;
        $row['dinner'] = isset($row['dinner']) ? (bool) intval($row['dinner']) : false;
        $row['transport'] = !empty($row['transport']) ? $row['transport'] : null;

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
    // prefer explicit duration; if missing but both dates provided, compute from dates (inclusive)
    if (isset($input['duration_days'])) {
        $duration = intval($input['duration_days']);
    } else if (!empty($input['start_date']) && !empty($input['end_date'])) {
        $sd = strtotime($input['start_date']);
        $ed = strtotime($input['end_date']);
        if ($sd && $ed && $ed >= $sd) {
            $duration = intval(floor(($ed - $sd) / 86400)) + 1;
        } else {
            $duration = 1;
        }
    } else {
        $duration = 1;
    }
    $breakfast = isset($input['breakfast']) ? (int) $input['breakfast'] : 0;
    $lunch = isset($input['lunch']) ? (int) $input['lunch'] : 0;
    $dinner = isset($input['dinner']) ? (int) $input['dinner'] : 0;
    $transport = $input['transport'] ?? null;
    $start_date = $input['start_date'] ?? null;
    $end_date = $input['end_date'] ?? null;
    $image_url = $input['image_url'] ?? null;

    $stmt = safe_prepare($conn, "INSERT INTO tour_packages (name, description, price, duration_days, breakfast, lunch, dinner, transport, start_date, end_date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssdiiisssss', $name, $desc, $price, $duration, $breakfast, $lunch, $dinner, $transport, $start_date, $end_date, $image_url);

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

    // support new fields: breakfast, lunch, dinner, transport, start_date, end_date
    $extra = ['breakfast' => 'i', 'lunch' => 'i', 'dinner' => 'i', 'transport' => 's', 'start_date' => 's', 'end_date' => 's'];
    foreach ($extra as $field => $t) {
        if (array_key_exists($field, $input)) {
            $fields[] = "$field = ?";
            $types .= $t;
            $params[] = $input[$field];
        }
    }

    // If duration wasn't provided but start/end dates are being updated, compute a duration value and include it
    if (!array_key_exists('duration_days', $input) && array_key_exists('start_date', $input) && array_key_exists('end_date', $input)) {
        $sd = strtotime($input['start_date']);
        $ed = strtotime($input['end_date']);
        if ($sd && $ed && $ed >= $sd) {
            $computed = intval(floor(($ed - $sd) / 86400)) + 1;
        } else {
            $computed = 1;
        }
        $fields[] = "duration_days = ?";
        $types .= 'i';
        $params[] = $computed;
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