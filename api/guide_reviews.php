<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

function json_exit_gr($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

if ($method === 'GET') {
    // list reviews for a guide
    if (!isset($_GET['guide_id']))
        json_exit_gr(['success' => false, 'error' => 'guide_id required'], 400);
    $gid = intval($_GET['guide_id']);
    $stmt = $conn->prepare("SELECT gr.id, gr.guide_id, gr.user_id, gr.rating, gr.comment, gr.created_at, u.name AS user_name FROM guide_reviews gr LEFT JOIN users u ON u.id = gr.user_id WHERE gr.guide_id = ? ORDER BY gr.created_at DESC LIMIT 200");
    $stmt->bind_param('i', $gid);
    $stmt->execute();
    $res = $stmt->get_result();
    $rows = [];
    while ($r = $res->fetch_assoc())
        $rows[] = $r;
    json_exit_gr(['success' => true, 'data' => $rows]);

} elseif ($method === 'POST') {
    // add review (logged in or anonymous)
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['guide_id']) || !isset($input['rating']))
        json_exit_gr(['success' => false, 'error' => 'guide_id and rating required'], 400);
    $guide_id = intval($input['guide_id']);
    $rating = intval($input['rating']);
    $comment = isset($input['comment']) ? $conn->real_escape_string(trim($input['comment'])) : null;
    $user_id = null;
    if (isLoggedIn())
        $user_id = $_SESSION['user_id'];

    if ($rating < 1 || $rating > 5)
        json_exit_gr(['success' => false, 'error' => 'Rating must be between 1 and 5'], 400);

    $stmt = $conn->prepare("INSERT INTO guide_reviews (guide_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('iiis', $guide_id, $user_id, $rating, $comment);
    if ($stmt->execute())
        json_exit_gr(['success' => true, 'id' => $conn->insert_id], 201);
    json_exit_gr(['success' => false, 'error' => $stmt->error], 500);

} elseif ($method === 'DELETE') {
    // delete review: admin or owner
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']))
        json_exit_gr(['success' => false, 'error' => 'id required'], 400);
    $id = intval($input['id']);
    $is_admin = isAdmin();
    $user_id = isLoggedIn() ? $_SESSION['user_id'] : null;

    // check ownership unless admin
    if (!$is_admin) {
        $chk = $conn->prepare("SELECT user_id FROM guide_reviews WHERE id = ?");
        $chk->bind_param('i', $id);
        $chk->execute();
        $r = $chk->get_result()->fetch_assoc();
        if (!$r)
            json_exit_gr(['success' => false, 'error' => 'Not found'], 404);
        if ($r['user_id'] === null || intval($r['user_id']) !== intval($user_id))
            json_exit_gr(['success' => false, 'error' => 'Forbidden'], 403);
    }

    $del = $conn->prepare("DELETE FROM guide_reviews WHERE id = ?");
    $del->bind_param('i', $id);
    if ($del->execute())
        json_exit_gr(['success' => true]);
    json_exit_gr(['success' => false, 'error' => $del->error], 500);

}

json_exit_gr(['success' => false, 'error' => 'Method not allowed'], 405);
