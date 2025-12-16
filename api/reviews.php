<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch approved and pending reviews, prefer linked user name/email when available
    $stmt = $conn->prepare("SELECT r.id, r.user_id, COALESCE(u.name, r.name) AS name, COALESCE(u.email, r.email) AS email, r.location, r.tour, r.rating, r.comment, r.date, r.status FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.status IN ('approved', 'pending') ORDER BY r.created_at DESC LIMIT 100");
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

    // If user is logged in, capture their id and use session name/email if not provided
    $linked_user_id = null;
    if (isLoggedIn()) {
        $user = getCurrentUser();
        $linked_user_id = isset($user['id']) ? intval($user['id']) : null;
        if (!isset($input['name']))
            $input['name'] = $user['name'] ?? '';
        if (!isset($input['email']))
            $input['email'] = $user['email'] ?? '';
    }

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

    // Insert review - include user_id when available
    if ($linked_user_id !== null) {
        $stmt = $conn->prepare("INSERT INTO reviews (user_id, name, email, location, tour, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->bind_param('issssis', $linked_user_id, $name, $email, $location, $tour, $rating, $comment);
    } else {
        $stmt = $conn->prepare("INSERT INTO reviews (name, email, location, tour, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->bind_param('ssssis', $name, $email, $location, $tour, $rating, $comment);
    }

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
