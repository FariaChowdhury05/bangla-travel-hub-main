<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

function json_exit($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function safe_prepare($conn, $sql)
{
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        json_exit(['success' => false, 'error' => 'Prepare failed: ' . $conn->error], 500);
    }
    return $stmt;
}

if ($method === 'GET') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);
    $user_id = $_SESSION['user_id'];
    $is_admin = isAdmin();

    $booking_id = isset($_GET['booking_id']) ? intval($_GET['booking_id']) : null;
    $admin_all = isset($_GET['admin_all']) ? true : false;

    if ($booking_id) {
        // verify access: admin or owner
        if (!$is_admin) {
            $b = safe_prepare($conn, "SELECT user_id FROM bookings WHERE id = ?");
            $b->bind_param('i', $booking_id);
            $b->execute();
            $bk = $b->get_result()->fetch_assoc();
            if (!$bk)
                json_exit(['success' => false, 'error' => 'Booking not found'], 404);
            if ($bk['user_id'] != $user_id)
                json_exit(['success' => false, 'error' => 'Forbidden'], 403);
        }
        $stmt = safe_prepare($conn, "SELECT p.id, p.booking_id, p.method, CAST(p.amount AS DECIMAL(10,2)) AS amount, p.status, p.transaction_id, p.notes, p.created_at FROM payments p WHERE p.booking_id = ? ORDER BY p.created_at DESC");
        $stmt->bind_param('i', $booking_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $payments = [];
        while ($r = $res->fetch_assoc()) {
            $r['amount'] = (float) $r['amount'];
            $payments[] = $r;
        }
        json_exit(['success' => true, 'data' => $payments]);
    }

    // list: admin all or user's payments
    if ($is_admin && $admin_all) {
        $sql = "SELECT p.id, p.booking_id, p.method, CAST(p.amount AS DECIMAL(10,2)) AS amount, p.status, p.transaction_id, p.notes, p.created_at, b.user_id, u.name AS user_name, u.email AS user_email FROM payments p JOIN bookings b ON b.id = p.booking_id LEFT JOIN users u ON u.id = b.user_id ORDER BY p.created_at DESC LIMIT 1000";
        $stmt = safe_prepare($conn, $sql);
        $stmt->execute();
        $res = $stmt->get_result();
        $payments = [];
        while ($r = $res->fetch_assoc()) {
            $r['amount'] = (float) $r['amount'];
            $payments[] = $r;
        }
        json_exit(['success' => true, 'data' => $payments]);
    }

    // non-admin: return payments for this user's bookings
    $stmt = safe_prepare($conn, "SELECT p.id, p.booking_id, p.method, CAST(p.amount AS DECIMAL(10,2)) AS amount, p.status, p.transaction_id, p.notes, p.created_at FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE b.user_id = ? ORDER BY p.created_at DESC");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $payments = [];
    while ($r = $res->fetch_assoc()) {
        $r['amount'] = (float) $r['amount'];
        $payments[] = $r;
    }
    json_exit(['success' => true, 'data' => $payments]);
}

if ($method === 'POST') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input))
        json_exit(['success' => false, 'error' => 'Invalid JSON'], 400);
    if (!isset($input['booking_id']) || !isset($input['method']) || !isset($input['amount']))
        json_exit(['success' => false, 'error' => 'Missing required fields'], 400);

    $booking_id = intval($input['booking_id']);
    $method_name = $conn->real_escape_string(trim($input['method']));
    $amount = floatval($input['amount']);
    $status = isset($input['status']) ? $conn->real_escape_string(trim($input['status'])) : 'initiated';
    $transaction_id = isset($input['transaction_id']) ? $conn->real_escape_string(trim($input['transaction_id'])) : null;
    $notes = isset($input['notes']) ? $conn->real_escape_string(trim($input['notes'])) : null;

    // verify booking exists and permission
    $b = safe_prepare($conn, "SELECT user_id FROM bookings WHERE id = ?");
    $b->bind_param('i', $booking_id);
    $b->execute();
    $bk = $b->get_result()->fetch_assoc();
    if (!$bk)
        json_exit(['success' => false, 'error' => 'Booking not found'], 404);
    $user_id = $_SESSION['user_id'];
    if (!isAdmin() && $bk['user_id'] != $user_id)
        json_exit(['success' => false, 'error' => 'Forbidden'], 403);

    $ins = safe_prepare($conn, "INSERT INTO payments (booking_id, method, amount, status, transaction_id, notes) VALUES (?, ?, ?, ?, ?, ?)");
    $ins->bind_param('isdsss', $booking_id, $method_name, $amount, $status, $transaction_id, $notes);
    if (!$ins->execute())
        json_exit(['success' => false, 'error' => $ins->error], 500);
    $pid = $conn->insert_id;

    // if payment is successful, update booking status
    if ($status === 'paid') {
        $u = safe_prepare($conn, "UPDATE bookings SET status = 'confirmed' WHERE id = ?");
        $u->bind_param('i', $booking_id);
        $u->execute();
    }

    json_exit(['success' => true, 'id' => $pid], 201);
}

if ($method === 'PATCH') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']) || !isset($input['status']))
        json_exit(['success' => false, 'error' => 'Missing id or status'], 400);

    $id = intval($input['id']);
    $new_status = $conn->real_escape_string(trim($input['status']));
    $transaction_id = isset($input['transaction_id']) ? $conn->real_escape_string(trim($input['transaction_id'])) : null;
    $notes = isset($input['notes']) ? $conn->real_escape_string(trim($input['notes'])) : null;

    $stmt = safe_prepare($conn, "SELECT booking_id FROM payments WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $p = $stmt->get_result()->fetch_assoc();
    if (!$p)
        json_exit(['success' => false, 'error' => 'Payment not found'], 404);
    $booking_id = $p['booking_id'];

    // permission: admin or booking owner
    $b = safe_prepare($conn, "SELECT user_id FROM bookings WHERE id = ?");
    $b->bind_param('i', $booking_id);
    $b->execute();
    $bk = $b->get_result()->fetch_assoc();
    if (!$bk)
        json_exit(['success' => false, 'error' => 'Booking not found'], 404);
    $user_id = $_SESSION['user_id'];
    if (!isAdmin() && $bk['user_id'] != $user_id)
        json_exit(['success' => false, 'error' => 'Forbidden'], 403);

    $upd = safe_prepare($conn, "UPDATE payments SET status = ?, transaction_id = ?, notes = ? WHERE id = ?");
    $upd->bind_param('sssi', $new_status, $transaction_id, $notes, $id);
    if (!$upd->execute())
        json_exit(['success' => false, 'error' => $upd->error], 500);

    // reflect on booking status
    if ($new_status === 'paid') {
        $u = safe_prepare($conn, "UPDATE bookings SET status = 'confirmed' WHERE id = ?");
        $u->bind_param('i', $booking_id);
        $u->execute();
    } elseif ($new_status === 'refunded') {
        $u = safe_prepare($conn, "UPDATE bookings SET status = 'refunded' WHERE id = ?");
        $u->bind_param('i', $booking_id);
        $u->execute();
    }

    json_exit(['success' => true, 'message' => 'Payment updated']);
}

json_exit(['success' => false, 'error' => 'Method not allowed'], 405);

?>