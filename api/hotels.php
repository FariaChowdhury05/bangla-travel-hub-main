<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Optionally filter by destination_id
    $destination_id = isset($_GET['destination_id']) ? intval($_GET['destination_id']) : null;

    if ($destination_id) {
        $stmt = $conn->prepare("SELECT id, destination_id, name, description, image_url, rating, address, phone, created_at FROM hotels WHERE destination_id = ? ORDER BY created_at DESC");
        $stmt->bind_param('i', $destination_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $stmt = $conn->prepare("SELECT id, destination_id, name, description, image_url, rating, address, phone, created_at FROM hotels ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();
    }

    $hotels = [];
    while ($row = $result->fetch_assoc()) {
        $hotels[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $hotels]);
    exit();
} elseif ($method === 'POST') {
    // Admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can create hotels']);
        exit();
    }
    // Support multipart/form-data (file upload) or JSON body
    $destination_id = null;
    $name = null;
    $description = null;
    $image_url = null;
    $rating = 4.0;
    $address = null;
    $phone = null;

    if (!empty($_POST)) {
        $destination_id = isset($_POST['destination_id']) ? intval($_POST['destination_id']) : null;
        $name = isset($_POST['name']) ? $conn->real_escape_string(trim($_POST['name'])) : null;
        $description = isset($_POST['description']) ? $conn->real_escape_string(trim($_POST['description'])) : null;
        $image_url = isset($_POST['image_url']) ? $conn->real_escape_string(trim($_POST['image_url'])) : null;
        $rating = isset($_POST['rating']) ? floatval($_POST['rating']) : $rating;
        $address = isset($_POST['address']) ? $conn->real_escape_string(trim($_POST['address'])) : null;
        $phone = isset($_POST['phone']) ? $conn->real_escape_string(trim($_POST['phone'])) : null;
    } else {
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $destination_id = isset($input['destination_id']) ? intval($input['destination_id']) : null;
            $name = isset($input['name']) ? $conn->real_escape_string(trim($input['name'])) : null;
            $description = isset($input['description']) ? $conn->real_escape_string(trim($input['description'])) : null;
            $image_url = isset($input['image_url']) ? $conn->real_escape_string(trim($input['image_url'])) : null;
            $rating = isset($input['rating']) ? floatval($input['rating']) : $rating;
            $address = isset($input['address']) ? $conn->real_escape_string(trim($input['address'])) : null;
            $phone = isset($input['phone']) ? $conn->real_escape_string(trim($input['phone'])) : null;
        }
    }

    // Handle uploaded file if present
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadsDir = __DIR__ . '/uploads/hotels';
        if (!is_dir($uploadsDir))
            mkdir($uploadsDir, 0755, true);
        $tmpName = $_FILES['image']['tmp_name'];
        $origName = basename($_FILES['image']['name']);
        $ext = pathinfo($origName, PATHINFO_EXTENSION);
        $fileName = uniqid('hotel_', true) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $fileName;
        if (move_uploaded_file($tmpName, $destPath)) {
            $image_url = rtrim('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']), '/') . '/uploads/hotels/' . $fileName;
        }
    }

    if (!$destination_id || !$name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO hotels (destination_id, name, description, image_url, rating, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('isssdss', $destination_id, $name, $description, $image_url, $rating, $address, $phone);

    if ($stmt->execute()) {
        // Update destination hotel_count
        $conn->query("UPDATE destinations SET hotel_count = hotel_count + 1 WHERE id = " . $destination_id);
        echo json_encode(['success' => true, 'message' => 'Hotel created', 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
} elseif ($method === 'DELETE') {
    // Admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can delete hotels']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Hotel ID required']);
        exit();
    }
    $id = intval($input['id']);

    // find destination id to decrement count
    $stmt = $conn->prepare("SELECT destination_id FROM hotels WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $destination_id = $row ? intval($row['destination_id']) : null;

    $stmt = $conn->prepare("DELETE FROM hotels WHERE id = ?");
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        if ($destination_id)
            $conn->query("UPDATE destinations SET hotel_count = GREATEST(0, hotel_count - 1) WHERE id = " . $destination_id);
        echo json_encode(['success' => true, 'message' => 'Hotel deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}

$conn->close();
