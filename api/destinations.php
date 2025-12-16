<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch destinations with dynamic hotel counts
    $sql = "SELECT d.id, d.name, d.description, d.image_url, d.rating, d.latitude, d.longitude, d.location_info, d.highlights, d.best_time_to_visit, d.created_at, d.updated_at, COUNT(h.id) AS hotel_count
            FROM destinations d
            LEFT JOIN hotels h ON h.destination_id = d.id
            GROUP BY d.id
            ORDER BY d.created_at DESC";

    $result = $conn->query($sql);
    $destinations = [];
    while ($row = $result->fetch_assoc()) {
        $destinations[] = $row;
    }

    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $destinations]);

} elseif ($method === 'POST') {
    // Create destination - admin only. Accepts multipart/form-data (for image) or JSON body with image_url.
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can create destinations']);
        exit();
    }

    $name = null;
    $description = null;
    $image_url = null;
    $rating = 4.5;
    $latitude = null;
    $longitude = null;
    $location_info = null;
    $highlights = null;
    $best_time_to_visit = null;

    // If multipart/form-data (file upload)
    if (!empty($_POST)) {
        $name = isset($_POST['name']) ? $conn->real_escape_string(trim($_POST['name'])) : null;
        $description = isset($_POST['description']) ? $conn->real_escape_string(trim($_POST['description'])) : null;
        $rating = isset($_POST['rating']) ? floatval($_POST['rating']) : $rating;
        $latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : null;
        $longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : null;
        $location_info = isset($_POST['location_info']) ? $conn->real_escape_string(trim($_POST['location_info'])) : null;
        $highlights = isset($_POST['highlights']) ? $conn->real_escape_string(trim($_POST['highlights'])) : null;
        $best_time_to_visit = isset($_POST['best_time_to_visit']) ? $conn->real_escape_string(trim($_POST['best_time_to_visit'])) : null;
        if (isset($_POST['image_url']))
            $image_url = $conn->real_escape_string(trim($_POST['image_url']));
    } else {
        // Try JSON body
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $name = isset($input['name']) ? $conn->real_escape_string(trim($input['name'])) : null;
            $description = isset($input['description']) ? $conn->real_escape_string(trim($input['description'])) : null;
            $rating = isset($input['rating']) ? floatval($input['rating']) : $rating;
            $latitude = isset($input['latitude']) ? floatval($input['latitude']) : null;
            $longitude = isset($input['longitude']) ? floatval($input['longitude']) : null;
            $location_info = isset($input['location_info']) ? $conn->real_escape_string(trim($input['location_info'])) : null;
            $highlights = isset($input['highlights']) ? $conn->real_escape_string(trim($input['highlights'])) : null;
            $best_time_to_visit = isset($input['best_time_to_visit']) ? $conn->real_escape_string(trim($input['best_time_to_visit'])) : null;
            if (isset($input['image_url']))
                $image_url = $conn->real_escape_string(trim($input['image_url']));
        }
    }

    // Handle uploaded file if present
    if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadsDir = __DIR__ . '/uploads/destinations';
        if (!is_dir($uploadsDir))
            mkdir($uploadsDir, 0755, true);
        $tmpName = $_FILES['image']['tmp_name'];
        $origName = basename($_FILES['image']['name']);
        $ext = pathinfo($origName, PATHINFO_EXTENSION);
        $fileName = uniqid('dest_', true) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $fileName;
        if (move_uploaded_file($tmpName, $destPath)) {
            $image_url = rtrim('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']), '/') . '/uploads/destinations/' . $fileName;
        }
    }

    if (!$name || !$description) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name and description are required']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO destinations (name, description, image_url, rating, latitude, longitude, location_info, highlights, best_time_to_visit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('sssddssss', $name, $description, $image_url, $rating, $latitude, $longitude, $location_info, $highlights, $best_time_to_visit);

    if ($stmt->execute()) {
        $destination_id = $conn->insert_id;
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Destination created successfully', 'id' => $destination_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error creating destination: ' . $conn->error]);
    }

} elseif ($method === 'DELETE') {
    // Delete destination - admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Destination ID is required']);
        exit();
    }

    $id = intval($input['id']);
    $stmt = $conn->prepare("DELETE FROM destinations WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Destination deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Destination not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error deleting destination: ' . $conn->error]);
    }

} elseif ($method === 'PATCH') {
    // Admin only
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can update destinations']);
        exit();
    }
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Destination ID required']);
        exit();
    }
    $id = intval($input['id']);

    $fields = [];
    $params = [];
    if (isset($input['name'])) {
        $fields[] = 'name = ?';
        $params[] = $conn->real_escape_string(trim($input['name']));
    }
    if (isset($input['description'])) {
        $fields[] = 'description = ?';
        $params[] = $conn->real_escape_string(trim($input['description']));
    }
    if (isset($input['image_url'])) {
        $fields[] = 'image_url = ?';
        $params[] = $conn->real_escape_string(trim($input['image_url']));
    }
    if (isset($input['rating'])) {
        $fields[] = 'rating = ?';
        $params[] = floatval($input['rating']);
    }
    if (isset($input['latitude'])) {
        $fields[] = 'latitude = ?';
        $params[] = floatval($input['latitude']);
    }
    if (isset($input['longitude'])) {
        $fields[] = 'longitude = ?';
        $params[] = floatval($input['longitude']);
    }
    if (isset($input['location_info'])) {
        $fields[] = 'location_info = ?';
        $params[] = $conn->real_escape_string(trim($input['location_info']));
    }
    if (isset($input['highlights'])) {
        $fields[] = 'highlights = ?';
        $params[] = $conn->real_escape_string(trim($input['highlights']));
    }
    if (isset($input['best_time_to_visit'])) {
        $fields[] = 'best_time_to_visit = ?';
        $params[] = $conn->real_escape_string(trim($input['best_time_to_visit']));
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit();
    }

    $sql = 'UPDATE destinations SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);

    $types = '';
    foreach ($params as $p) {
        if (is_int($p))
            $types .= 'i';
        elseif (is_float($p))
            $types .= 'd';
        else
            $types .= 's';
    }
    $types .= 'i';
    $params[] = $id;

    $bind_names = [];
    $bind_names[] = $types;
    for ($i = 0; $i < count($params); $i++) {
        $bind_name = 'param' . $i;
        $$bind_name = $params[$i];
        $bind_names[] = &$$bind_name;
    }
    call_user_func_array([$stmt, 'bind_param'], $bind_names);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Destination updated']);
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