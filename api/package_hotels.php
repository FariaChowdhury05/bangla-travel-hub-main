<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth-config.php';

header('Content-Type: application/json; charset=utf-8');

$package_id = isset($_GET['package_id']) ? intval($_GET['package_id']) : 0;
if (!$package_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'package_id required']);
    exit();
}

// fetch package
$stmt = $conn->prepare("SELECT id, name, description, price, duration_days, image_url, breakfast, lunch, dinner, transport, start_date, end_date FROM tour_packages WHERE id = ?");
$stmt->bind_param('i', $package_id);
$stmt->execute();
$pkg = $stmt->get_result()->fetch_assoc();
if (!$pkg) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Package not found']);
    exit();
}
$pkg['price'] = (float) $pkg['price'];
$pkg['duration_days'] = isset($pkg['duration_days']) ? intval($pkg['duration_days']) : 1;
$pkg['breakfast'] = isset($pkg['breakfast']) ? (bool) intval($pkg['breakfast']) : false;
$pkg['lunch'] = isset($pkg['lunch']) ? (bool) intval($pkg['lunch']) : false;
$pkg['dinner'] = isset($pkg['dinner']) ? (bool) intval($pkg['dinner']) : false;
$pkg['transport'] = !empty($pkg['transport']) ? $pkg['transport'] : null;

// fetch destinations for this package
$dest_stmt = $conn->prepare("SELECT d.id, d.name, d.description, pd.sequence FROM package_destinations pd JOIN destinations d ON d.id = pd.destination_id WHERE pd.package_id = ? ORDER BY pd.sequence ASC");
$dest_stmt->bind_param('i', $package_id);
$dest_stmt->execute();
$dest_res = $dest_stmt->get_result();
$destinations = [];
while ($d = $dest_res->fetch_assoc()) {
    $d['id'] = (int) $d['id'];
    $d['sequence'] = (int) $d['sequence'];
    // fetch hotels for this destination
    $hstmt = $conn->prepare("SELECT id, destination_id, name, description, image_url, rating FROM hotels WHERE destination_id = ? ORDER BY created_at DESC");
    $hstmt->bind_param('i', $d['id']);
    $hstmt->execute();
    $hres = $hstmt->get_result();
    $hotels = [];
    while ($h = $hres->fetch_assoc()) {
        $h['id'] = (int) $h['id'];
        $h['destination_id'] = (int) $h['destination_id'];
        $h['rating'] = isset($h['rating']) ? (float) $h['rating'] : null;
        $hotels[] = $h;
    }
    $d['hotels'] = $hotels;
    $destinations[] = $d;
}

echo json_encode(['success' => true, 'data' => ['package' => $pkg, 'destinations' => $destinations]]);
exit();
