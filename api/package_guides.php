<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

function json_exit_pg($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

if ($method === 'GET') {
    // return guides for a package_id
    if (!isset($_GET['package_id']))
        json_exit_pg(['success' => false, 'error' => 'package_id required'], 400);
    $pid = intval($_GET['package_id']);
    $stmt = $conn->prepare("SELECT g.id, g.name, g.phone, g.email, g.city, g.experience_years, g.rating, g.rate_per_day, g.status, pg.is_primary FROM package_guides pg JOIN guides g ON g.id = pg.guide_id WHERE pg.package_id = ? ORDER BY pg.is_primary DESC, g.name ASC");
    $stmt->bind_param('i', $pid);
    $stmt->execute();
    $res = $stmt->get_result();
    $guides = [];
    while ($r = $res->fetch_assoc())
        $guides[] = $r;
    json_exit_pg(['success' => true, 'data' => $guides]);

} elseif ($method === 'POST') {
    // assign guide to package (admin only)
    if (!isAdmin())
        json_exit_pg(['success' => false, 'error' => 'Forbidden'], 403);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['package_id']) || !isset($input['guide_id']))
        json_exit_pg(['success' => false, 'error' => 'package_id and guide_id required'], 400);
    $pid = intval($input['package_id']);
    $gid = intval($input['guide_id']);
    $is_primary = isset($input['is_primary']) && $input['is_primary'] ? 1 : 0;

    // if is_primary set, unset other primary for this package
    if ($is_primary) {
        $u = $conn->prepare("UPDATE package_guides SET is_primary = 0 WHERE package_id = ?");
        $u->bind_param('i', $pid);
        $u->execute();
    }

    $stmt = $conn->prepare("REPLACE INTO package_guides (package_id, guide_id, is_primary) VALUES (?, ?, ?)");
    $stmt->bind_param('iii', $pid, $gid, $is_primary);
    if ($stmt->execute())
        json_exit_pg(['success' => true]);
    json_exit_pg(['success' => false, 'error' => $stmt->error], 500);

} elseif ($method === 'DELETE') {
    if (!isAdmin())
        json_exit_pg(['success' => false, 'error' => 'Forbidden'], 403);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['package_id']) || !isset($input['guide_id']))
        json_exit_pg(['success' => false, 'error' => 'package_id and guide_id required'], 400);
    $pid = intval($input['package_id']);
    $gid = intval($input['guide_id']);
    $stmt = $conn->prepare("DELETE FROM package_guides WHERE package_id = ? AND guide_id = ?");
    $stmt->bind_param('ii', $pid, $gid);
    if ($stmt->execute())
        json_exit_pg(['success' => true]);
    json_exit_pg(['success' => false, 'error' => $stmt->error], 500);
}

json_exit_pg(['success' => false, 'error' => 'Method not allowed'], 405);
