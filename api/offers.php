<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];

function json_exit_off($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

if ($method === 'GET') {
    // list offers; optional filters: package_id, active_only
    $package_id = isset($_GET['package_id']) ? intval($_GET['package_id']) : null;
    $active_only = isset($_GET['active_only']) ? true : false;

    $sql = "SELECT * FROM offers WHERE 1=1";
    if ($active_only) {
        $today = date('Y-m-d');
        $sql .= " AND status = 'active' AND start_date <= '" . $conn->real_escape_string($today) . "' AND end_date >= '" . $conn->real_escape_string($today) . "'";
    }
    $sql .= " ORDER BY start_date DESC";

    $res = $conn->query($sql);
    if ($res === false)
        json_exit_off(['success' => false, 'error' => $conn->error], 500);
    $offers = [];
    while ($r = $res->fetch_assoc())
        $offers[] = $r;

    // enrich with package_ids
    foreach ($offers as &$of) {
        $pkg_stmt = $conn->prepare("SELECT package_id FROM package_offers WHERE offer_id = ?");
        $pkg_stmt->bind_param('i', $of['id']);
        $pkg_stmt->execute();
        $pkg_res = $pkg_stmt->get_result();
        $pids = [];
        while ($prow = $pkg_res->fetch_assoc())
            $pids[] = intval($prow['package_id']);
        $of['package_ids'] = $pids;
        // also include basic package details for public display
        $of_packages = [];
        if (count($pids) > 0) {
            $pkg_detail_stmt = $conn->prepare("SELECT id, name, price, image_url FROM tour_packages WHERE id = ?");
            foreach ($pids as $pid) {
                $pkg_detail_stmt->bind_param('i', $pid);
                $pkg_detail_stmt->execute();
                $pd = $pkg_detail_stmt->get_result()->fetch_assoc();
                if ($pd) {
                    $pd['id'] = intval($pd['id']);
                    $pd['price'] = (float) $pd['price'];
                    $of_packages[] = $pd;
                }
            }
        }
        $of['packages'] = $of_packages;
    }

    // if package filter, return only offers linked to that package
    if ($package_id) {
        $out = [];
        foreach ($offers as $o) {
            $chk = $conn->prepare("SELECT 1 FROM package_offers WHERE package_id = ? AND offer_id = ?");
            $chk->bind_param('ii', $package_id, $o['id']);
            $chk->execute();
            $g = $chk->get_result()->fetch_assoc();
            if ($g)
                $out[] = $o;
        }
        json_exit_off(['success' => true, 'data' => $out]);
    }

    json_exit_off(['success' => true, 'data' => $offers]);
}

// admin-only below
if (!isAdmin())
    json_exit_off(['success' => false, 'error' => 'Admin only'], 403);

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['title']))
        json_exit_off(['success' => false, 'error' => 'title required'], 400);
    $title = $conn->real_escape_string($input['title']);
    $desc = isset($input['description']) ? $conn->real_escape_string($input['description']) : null;
    $dtype = isset($input['discount_type']) && in_array($input['discount_type'], ['percentage', 'flat']) ? $input['discount_type'] : 'percentage';
    $dval = isset($input['discount_value']) ? floatval($input['discount_value']) : 0.0;
    $start = isset($input['start_date']) ? $conn->real_escape_string($input['start_date']) : null;
    $end = isset($input['end_date']) ? $conn->real_escape_string($input['end_date']) : null;
    $status = isset($input['status']) && in_array($input['status'], ['active', 'inactive']) ? $input['status'] : 'inactive';

    if (!$start || !$end)
        json_exit_off(['success' => false, 'error' => 'start_date and end_date required'], 400);

    $stmt = $conn->prepare("INSERT INTO offers (title, description, discount_type, discount_value, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('sssdsss', $title, $desc, $dtype, $dval, $start, $end, $status);
    if (!$stmt->execute())
        json_exit_off(['success' => false, 'error' => $stmt->error], 500);
    $offer_id = $conn->insert_id;

    // associate packages if provided
    if (isset($input['package_ids']) && is_array($input['package_ids'])) {
        $ins = $conn->prepare("REPLACE INTO package_offers (package_id, offer_id) VALUES (?, ?)");
        foreach ($input['package_ids'] as $pid) {
            $pid = intval($pid);
            $ins->bind_param('ii', $pid, $offer_id);
            $ins->execute();
        }
    }

    json_exit_off(['success' => true, 'id' => $offer_id], 201);
}

if ($method === 'PATCH') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']))
        json_exit_off(['success' => false, 'error' => 'id required'], 400);
    $id = intval($input['id']);
    $fields = [];
    $types = '';
    $vals = [];
    $map = ['title' => 's', 'description' => 's', 'discount_type' => 's', 'discount_value' => 'd', 'start_date' => 's', 'end_date' => 's', 'status' => 's'];
    foreach ($map as $k => $t)
        if (array_key_exists($k, $input)) {
            $fields[] = "$k = ?";
            $types .= $t;
            $vals[] = $input[$k];
        }
    if (!count($fields))
        json_exit_off(['success' => false, 'error' => 'nothing to update'], 400);
    $sql = "UPDATE offers SET " . implode(', ', $fields) . " WHERE id = ?";
    $vals[] = $id;
    $types .= 'i';
    $stmt = $conn->prepare($sql);
    $bind = array_merge([$types], $vals);
    $tmp = [];
    foreach ($bind as $k => $v)
        $tmp[$k] = &$bind[$k];
    call_user_func_array([$stmt, 'bind_param'], $tmp);
    if (!$stmt->execute())
        json_exit_off(['success' => false, 'error' => $stmt->error], 500);

    // update package associations if provided
    if (array_key_exists('package_ids', $input) && is_array($input['package_ids'])) {
        // delete existing
        $del = $conn->prepare("DELETE FROM package_offers WHERE offer_id = ?");
        $del->bind_param('i', $id);
        $del->execute();
        $ins = $conn->prepare("REPLACE INTO package_offers (package_id, offer_id) VALUES (?, ?)");
        foreach ($input['package_ids'] as $pid) {
            $pid = intval($pid);
            $ins->bind_param('ii', $pid, $id);
            $ins->execute();
        }
    }

    json_exit_off(['success' => true]);
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']))
        json_exit_off(['success' => false, 'error' => 'id required'], 400);
    $id = intval($input['id']);
    $stmt = $conn->prepare("DELETE FROM offers WHERE id = ?");
    $stmt->bind_param('i', $id);
    if (!$stmt->execute())
        json_exit_off(['success' => false, 'error' => $stmt->error], 500);
    json_exit_off(['success' => true]);
}

json_exit_off(['success' => false, 'error' => 'Method not allowed'], 405);
