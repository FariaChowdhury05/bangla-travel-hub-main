<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch approved and pending reviews
    $stmt = $conn->prepare("SELECT id, name, location, tour, rating, comment, date, status FROM reviews WHERE status IN ('approved', 'pending') ORDER BY created_at DESC LIMIT 100");
    $stmt->execute();

    $result = $stmt->get_result();
    $reviews = [];

    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }

    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $reviews]);
} elseif ($method === 'POST') {
    // Create new review
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate input
    if (
        !isset($input['name']) || !isset($input['email']) || !isset($input['location']) ||
        !isset($input['tour']) || !isset($input['rating']) || !isset($input['comment'])
    ) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit();
    }

    // Validate rating
    $rating = intval($input['rating']);
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Rating must be between 1 and 5']);
        exit();
    }

    // Sanitize input
    $name = $conn->real_escape_string(trim($input['name']));
    $email = $conn->real_escape_string(trim($input['email']));
    $location = $conn->real_escape_string(trim($input['location']));
    $tour = $conn->real_escape_string(trim($input['tour']));
    $comment = $conn->real_escape_string(trim($input['comment']));

    // Insert review
    $stmt = $conn->prepare("INSERT INTO reviews (name, email, location, tour, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param('ssssis', $name, $email, $location, $tour, $rating, $comment);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Review submitted successfully and is pending approval']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error inserting review: ' . $conn->error]);
    }

} elseif ($method === 'DELETE') {
    // Delete review - only admins allowed
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Review ID is required']);
        exit();
    }

    $id = intval($input['id']);

    $stmt = $conn->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Review deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Review not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error deleting review: ' . $conn->error]);
    }

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}

$conn->close();
