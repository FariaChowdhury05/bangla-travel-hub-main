<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

function json_exit_guides($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data);
    exit();
}

if ($method === 'GET') {
    // List guides or single guide by id
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM guides WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $guide = $stmt->get_result()->fetch_assoc();
        if (!$guide)
            json_exit_guides(['success' => false, 'error' => 'Guide not found'], 404);

        // fetch packages assigned
        $pkgStmt = $conn->prepare("SELECT p.id, p.name, pg.is_primary FROM package_guides pg JOIN tour_packages p ON p.id = pg.package_id WHERE pg.guide_id = ?");
        $pkgStmt->bind_param('i', $id);
        $pkgStmt->execute();
        $pkgs = [];
        $res = $pkgStmt->get_result();
        while ($r = $res->fetch_assoc())
            $pkgs[] = $r;
        $guide['packages'] = $pkgs;

        // fetch languages
        $langStmt = $conn->prepare("SELECT language FROM guide_languages WHERE guide_id = ? ORDER BY language ASC");
        $langStmt->bind_param('i', $id);
        $langStmt->execute();
        $lres = $langStmt->get_result();
        $langs = [];
        while ($lr = $lres->fetch_assoc())
            $langs[] = $lr['language'];
        $guide['languages'] = $langs;

        // compute average rating and review count from guide_reviews
        $rstmt = $conn->prepare("SELECT ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS review_count FROM guide_reviews WHERE guide_id = ?");
        $rstmt->bind_param('i', $id);
        $rstmt->execute();
        $rr = $rstmt->get_result()->fetch_assoc();
        $guide['avg_rating'] = $rr && $rr['avg_rating'] !== null ? (float) $rr['avg_rating'] : null;
        $guide['review_count'] = $rr ? intval($rr['review_count']) : 0;

        json_exit_guides(['success' => true, 'data' => $guide]);
    }

    $stmt = $conn->prepare("SELECT id, name, phone, email, city, experience_years, bio, status, rate_per_day, created_at FROM guides ORDER BY created_at DESC LIMIT 500");
    $stmt->execute();
    $res = $stmt->get_result();
    $guides = [];
    while ($g = $res->fetch_assoc()) {
        // attach packages list per guide
        $pkgStmt = $conn->prepare("SELECT p.id, p.name, pg.is_primary FROM package_guides pg JOIN tour_packages p ON p.id = pg.package_id WHERE pg.guide_id = ?");
        $pkgStmt->bind_param('i', $g['id']);
        $pkgStmt->execute();
        $pr = $pkgStmt->get_result();
        $pkgs = [];
        while ($p = $pr->fetch_assoc())
            $pkgs[] = $p;
        $g['packages'] = $pkgs;

        // attach rating and review count
        $rstmt = $conn->prepare("SELECT ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS review_count FROM guide_reviews WHERE guide_id = ?");
        $rstmt->bind_param('i', $g['id']);
        $rstmt->execute();
        $rres = $rstmt->get_result()->fetch_assoc();
        $g['avg_rating'] = $rres && $rres['avg_rating'] !== null ? (float) $rres['avg_rating'] : null;
        $g['review_count'] = $rres ? intval($rres['review_count']) : 0;
        // languages per guide
        $langStmt = $conn->prepare("SELECT language FROM guide_languages WHERE guide_id = ? ORDER BY language ASC");
        $langStmt->bind_param('i', $g['id']);
        $langStmt->execute();
        $lres = $langStmt->get_result();
        $langs = [];
        while ($lr = $lres->fetch_assoc())
            $langs[] = $lr['language'];
        $g['languages'] = $langs;
        $guides[] = $g;
    }

    json_exit_guides(['success' => true, 'data' => $guides]);

} elseif ($method === 'POST') {
    // Create guide (admin only)
    if (!isAdmin())
        json_exit_guides(['success' => false, 'error' => 'Forbidden'], 403);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['name']))
        json_exit_guides(['success' => false, 'error' => 'Name is required'], 400);

    $name = $conn->real_escape_string(trim($input['name']));
    $phone = isset($input['phone']) ? $conn->real_escape_string(trim($input['phone'])) : null;
    $email = isset($input['email']) ? $conn->real_escape_string(trim($input['email'])) : null;
    $city = isset($input['city']) ? $conn->real_escape_string(trim($input['city'])) : null;
    $experience_years = isset($input['experience_years']) ? intval($input['experience_years']) : 0;
    $bio = isset($input['bio']) ? $conn->real_escape_string(trim($input['bio'])) : null;
    $rating = isset($input['rating']) ? floatval($input['rating']) : 4.5;
    $status = isset($input['status']) ? $conn->real_escape_string($input['status']) : 'available';
    $rate_per_day = isset($input['rate_per_day']) ? floatval($input['rate_per_day']) : 0.00;
    if ($rate_per_day < 0)
        json_exit_guides(['success' => false, 'error' => 'rate_per_day cannot be negative'], 400);

    $stmt = $conn->prepare("INSERT INTO guides (name, phone, email, city, experience_years, bio, rating, status, rate_per_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssssisdsd', $name, $phone, $email, $city, $experience_years, $bio, $rating, $status, $rate_per_day);
    if ($stmt->execute()) {
        $newId = $conn->insert_id;
        // persist languages if provided (array)
        if (isset($input['languages']) && is_array($input['languages'])) {
            $insLang = $conn->prepare("INSERT INTO guide_languages (guide_id, language) VALUES (?, ?)");
            foreach ($input['languages'] as $lang) {
                $l = $conn->real_escape_string(trim($lang));
                if ($l === '')
                    continue;
                $insLang->bind_param('is', $newId, $l);
                $insLang->execute();
            }
        }
        json_exit_guides(['success' => true, 'id' => $newId], 201);
    }
    json_exit_guides(['success' => false, 'error' => $stmt->error], 500);

} elseif ($method === 'PATCH') {
    if (!isAdmin())
        json_exit_guides(['success' => false, 'error' => 'Forbidden'], 403);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id']))
        json_exit_guides(['success' => false, 'error' => 'id required'], 400);
    $id = intval($input['id']);

    $fields = [];
    $types = '';
    $vals = [];
    $possible = ['name', 'phone', 'email', 'city', 'experience_years', 'bio', 'rating', 'status', 'rate_per_day'];
    foreach ($possible as $p) {
        if (isset($input[$p])) {
            $fields[] = "$p = ?";
            $vals[] = $input[$p];
        }
    }
    // validate rate_per_day if present
    if (isset($input['rate_per_day']) && floatval($input['rate_per_day']) < 0)
        json_exit_guides(['success' => false, 'error' => 'rate_per_day cannot be negative'], 400);
    if (count($fields) === 0)
        json_exit_guides(['success' => false, 'error' => 'No fields to update'], 400);
    $sql = "UPDATE guides SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    // bind dynamically
    $vals[] = $id;
    $types = str_repeat('s', count($vals) - 1) . 'i';
    $bind_names[] = $types;
    for ($i = 0; $i < count($vals); $i++)
        $bind_names[] = &$vals[$i];
    call_user_func_array(array($stmt, 'bind_param'), $bind_names);
    if ($stmt->execute()) {
        // handle languages update if provided
        if (isset($input['languages']) && is_array($input['languages'])) {
            // delete existing
            $del = $conn->prepare("DELETE FROM guide_languages WHERE guide_id = ?");
            $del->bind_param('i', $id);
            $del->execute();
            $insLang = $conn->prepare("INSERT INTO guide_languages (guide_id, language) VALUES (?, ?)");
            foreach ($input['languages'] as $lang) {
                $l = $conn->real_escape_string(trim($lang));
                if ($l === '')
                    continue;
                $insLang->bind_param('is', $id, $l);
                $insLang->execute();
            }
        }
        json_exit_guides(['success' => true]);
    }
    json_exit_guides(['success' => false, 'error' => $stmt->error], 500);

} elseif ($method === 'DELETE') {
    if (!isAdmin())
        json_exit_guides(['success' => false, 'error' => 'Forbidden'], 403);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id']))
        json_exit_guides(['success' => false, 'error' => 'id required'], 400);
    $id = intval($input['id']);
    $stmt = $conn->prepare("DELETE FROM guides WHERE id = ?");
    $stmt->bind_param('i', $id);
    if ($stmt->execute())
        json_exit_guides(['success' => true]);
    json_exit_guides(['success' => false, 'error' => $stmt->error], 500);
}

json_exit_guides(['success' => false, 'error' => 'Method not allowed'], 405);
