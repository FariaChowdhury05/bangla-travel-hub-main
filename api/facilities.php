<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth-config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT id, name, description, created_at FROM facilities ORDER BY name ASC");
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc())
        $rows[] = $r;
    echo json_encode($rows);
    exit();
}

if (!isAdmin()) {
    // Only admins can modify facilities
    if ($method !== 'GET') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Only admins can modify facilities']);
        exit();
    }
}

if ($method === 'POST') {
    $input = $_POST;
    if (empty($input))
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = isset($input['name']) ? $conn->real_escape_string(trim($input['name'])) : null;
    $desc = isset($input['description']) ? $conn->real_escape_string(trim($input['description'])) : null;
    if (!$name) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name required']);
        exit();
    }
    $stmt = $conn->prepare("INSERT INTO facilities (name, description) VALUES (?, ?)");
    $stmt->bind_param('ss', $name, $desc);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    exit();
}

if ($method === 'PATCH') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit();
    }
    $name = isset($input['name']) ? $conn->real_escape_string(trim($input['name'])) : null;
    $desc = isset($input['description']) ? $conn->real_escape_string(trim($input['description'])) : null;
    $fields = [];
    $types = '';
    $params = [];
    if ($name !== null) {
        $fields[] = 'name = ?';
        $types .= 's';
        $params[] = $name;
    }
    if ($desc !== null) {
        $fields[] = 'description = ?';
        $types .= 's';
        $params[] = $desc;
    }
    if (!count($fields)) {
        echo json_encode(['success' => false, 'error' => 'Nothing to update']);
        exit();
    }
    $sql = "UPDATE facilities SET " . implode(', ', $fields) . " WHERE id = ?";
    $types .= 'i';
    $params[] = $id;
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
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
    $id = isset($input['id']) ? intval($input['id']) : (isset($_GET['id']) ? intval($_GET['id']) : null);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID required']);
        exit();
    }
    $stmt = $conn->prepare("DELETE FROM facilities WHERE id = ?");
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
