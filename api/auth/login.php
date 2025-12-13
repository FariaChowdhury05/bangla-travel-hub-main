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
if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password are required']);
    exit();
}

$email = trim($input['email']);
$password = trim($input['password']);

// Find user by email
$stmt = $conn->prepare("SELECT id, password, name, role FROM users WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit();
}

$user = $result->fetch_assoc();

// Verify password
if (!verifyPassword($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
    exit();
}

// Set session
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_email'] = $email;
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_role'] = $user['role'];

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'email' => $email,
        'name' => $user['name'],
        'role' => $user['role']
    ]
]);

$stmt->close();
$conn->close();
