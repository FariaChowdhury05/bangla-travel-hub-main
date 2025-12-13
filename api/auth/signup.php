<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../auth-config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email, password, and name are required']);
    exit();
}

$email = trim($input['email']);
$password = trim($input['password']);
$name = trim($input['name']);

// Validate email format
if (!isValidEmail($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid email format']);
    exit();
}

// Validate password
if (!isValidPassword($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
    exit();
}

// Validate name
if (strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name must be at least 2 characters']);
    exit();
}

// Check if email already exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Email already registered']);
    exit();
}

// Hash password
$hashedPassword = hashPassword($password);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, 'user')");
$stmt->bind_param('sss', $email, $hashedPassword, $name);

if ($stmt->execute()) {
    $userId = $conn->insert_id;

    // Set session
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_role'] = 'user';

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'name' => $name,
            'role' => 'user'
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error creating account: ' . $conn->error]);
}

$stmt->close();
$conn->close();
