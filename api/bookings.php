<?php
// api/bookings.php - robust, supports package_id + hotel bookings

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

/* GET handler (single booking with id or list) */
if ($method === 'GET') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);

    $user_id = $_SESSION['user_id'];
    $is_admin = isAdmin();
    $status_filter = isset($_GET['status']) ? $conn->real_escape_string(trim($_GET['status'])) : null;
    $filter_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $admin_all = isset($_GET['admin_all']) ? true : false;
    $booking_id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if ($booking_id) {
        $sql = "SELECT b.id, b.user_id, b.hotel_id, b.package_id,
                   COALESCE(h.name, p.name) AS booking_name,
                   CAST(b.total_amount AS DECIMAL(10,2)) AS total_amount,
                   b.status, b.check_in, b.check_out, b.nights, b.guest_count,
                   b.created_at, b.updated_at,
                   CASE WHEN b.hotel_id IS NOT NULL THEN 'hotel' ELSE 'package' END AS booking_type,
                   u.name AS user_name, u.email AS user_email,
                     b.guide_id, g.name AS guide_name, g.rate_per_day AS guide_rate_per_day
            FROM bookings b
            LEFT JOIN hotels h ON h.id = b.hotel_id
            LEFT JOIN tour_packages p ON p.id = b.package_id
            LEFT JOIN users u ON u.id = b.user_id
            LEFT JOIN guides g ON g.id = b.guide_id
            WHERE b.id = ?";
        $stmt = safe_prepare($conn, $sql);
        $stmt->bind_param('i', $booking_id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if (!$row)
            json_exit(['success' => false, 'error' => 'Booking not found'], 404);

        $row['total_amount'] = (float) $row['total_amount'];
        $row['nights'] = isset($row['nights']) ? intval($row['nights']) : 0;
        $row['guest_count'] = isset($row['guest_count']) ? intval($row['guest_count']) : 0;
        $row['guide_rate_per_day'] = isset($row['guide_rate_per_day']) ? (float) $row['guide_rate_per_day'] : null;

        if ($row['hotel_id']) {
            $rooms_stmt = safe_prepare($conn, "
                SELECT bi.id, bi.room_id, r.room_number, r.type, bi.price_per_night
                FROM booking_items bi
                JOIN rooms r ON r.id = bi.room_id
                WHERE bi.booking_id = ?
            ");
            $rooms_stmt->bind_param('i', $row['id']);
            $rooms_stmt->execute();
            $rooms_res = $rooms_stmt->get_result();
            $rooms = [];
            while ($rr = $rooms_res->fetch_assoc()) {
                $rr['price_per_night'] = (float) $rr['price_per_night'];
                $rooms[] = $rr;
            }
            $row['rooms'] = $rooms;
        }

        if ($row['package_id']) {
            $dest_stmt = safe_prepare($conn, "
                SELECT d.id, d.name, d.description, pd.sequence
                FROM package_destinations pd
                JOIN destinations d ON d.id = pd.destination_id
                WHERE pd.package_id = ?
                ORDER BY pd.sequence ASC
            ");
            $dest_stmt->bind_param('i', $row['package_id']);
            $dest_stmt->execute();
            $dest_res = $dest_stmt->get_result();
            $destinations = [];
            while ($d = $dest_res->fetch_assoc()) {
                $d['id'] = (int) $d['id'];
                $d['sequence'] = (int) $d['sequence'];
                $destinations[] = $d;
            }
            $row['destinations'] = $destinations;
        }

        json_exit(['success' => true, 'data' => $row]);
    }

    // List (admin_all or by user)
    if ($is_admin && $admin_all) {
        $sql = "SELECT b.id, b.user_id, b.hotel_id, b.package_id,
                   COALESCE(h.name, p.name) AS booking_name,
                   CAST(b.total_amount AS DECIMAL(10,2)) AS total_amount,
                   b.status, b.check_in, b.check_out, b.nights, b.guest_count,
                   b.created_at, b.updated_at,
                   CASE WHEN b.hotel_id IS NOT NULL THEN 'hotel' ELSE 'package' END AS booking_type,
                   u.name AS user_name, u.email AS user_email,
                     b.guide_id, g.name AS guide_name, g.rate_per_day AS guide_rate_per_day
            FROM bookings b
            LEFT JOIN hotels h ON h.id = b.hotel_id
            LEFT JOIN tour_packages p ON p.id = b.package_id
            LEFT JOIN users u ON u.id = b.user_id
            LEFT JOIN guides g ON g.id = b.guide_id
            WHERE 1=1";
        if ($status_filter)
            $sql .= " AND b.status = '" . $conn->real_escape_string($status_filter) . "'";
        $sql .= " ORDER BY b.created_at DESC LIMIT 500";
        $stmt = safe_prepare($conn, $sql);
        $stmt->execute();
    } else {
        if ($is_admin && $filter_user_id)
            $user_id = $filter_user_id;
        $sql = "SELECT b.id, b.user_id, b.hotel_id, b.package_id,
                   COALESCE(h.name, p.name) AS booking_name,
                   CAST(b.total_amount AS DECIMAL(10,2)) AS total_amount,
                   b.status, b.check_in, b.check_out, b.nights, b.guest_count,
                   b.created_at, b.updated_at,
                   CASE WHEN b.hotel_id IS NOT NULL THEN 'hotel' ELSE 'package' END AS booking_type,
                     u.name AS user_name, u.email AS user_email,
                     b.guide_id, g.name AS guide_name, g.rate_per_day AS guide_rate_per_day
            FROM bookings b
            LEFT JOIN hotels h ON h.id = b.hotel_id
            LEFT JOIN tour_packages p ON p.id = b.package_id
            LEFT JOIN users u ON u.id = b.user_id
            LEFT JOIN guides g ON g.id = b.guide_id
            WHERE b.user_id = ?";
        if ($status_filter)
            $sql .= " AND b.status = '" . $conn->real_escape_string($status_filter) . "'";
        $sql .= " ORDER BY b.created_at DESC LIMIT 500";
        $stmt = safe_prepare($conn, $sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
    }

    $result = $stmt->get_result();
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $row['total_amount'] = (float) $row['total_amount'];
        $row['nights'] = isset($row['nights']) ? intval($row['nights']) : 0;
        $row['guest_count'] = isset($row['guest_count']) ? intval($row['guest_count']) : 0;
        $row['guide_rate_per_day'] = isset($row['guide_rate_per_day']) ? (float) $row['guide_rate_per_day'] : null;

        if ($row['hotel_id']) {
            $rooms_stmt = safe_prepare($conn, "
                SELECT bi.id, bi.room_id, r.room_number, r.type, bi.price_per_night
                FROM booking_items bi
                JOIN rooms r ON r.id = bi.room_id
                WHERE bi.booking_id = ?
            ");
            $rooms_stmt->bind_param('i', $row['id']);
            $rooms_stmt->execute();
            $rr = $rooms_stmt->get_result();
            $rooms = [];
            while ($rrow = $rr->fetch_assoc()) {
                $rrow['price_per_night'] = (float) $rrow['price_per_night'];
                $rooms[] = $rrow;
            }
            $row['rooms'] = $rooms;
        }

        if ($row['package_id']) {
            $dest_stmt = safe_prepare($conn, "
                SELECT d.id, d.name, d.description, pd.sequence
                FROM package_destinations pd
                JOIN destinations d ON d.id = pd.destination_id
                WHERE pd.package_id = ?
                ORDER BY pd.sequence ASC
            ");
            $dest_stmt->bind_param('i', $row['package_id']);
            $dest_stmt->execute();
            $dr = $dest_stmt->get_result();
            $destinations = [];
            while ($drow = $dr->fetch_assoc()) {
                $drow['id'] = (int) $drow['id'];
                $drow['sequence'] = (int) $drow['sequence'];
                $destinations[] = $drow;
            }
            $row['destinations'] = $destinations;
        }

        $bookings[] = $row;
    }

    json_exit(['success' => true, 'data' => $bookings]);
}

/* POST handler */
if ($method === 'POST') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input))
        json_exit(['success' => false, 'error' => 'Invalid JSON'], 400);

    $user_id = $_SESSION['user_id'];

    // Package booking (with possible hotel rooms too)
    if (!empty($input['package_id'])) {
        $package_id = intval($input['package_id']);
        $guest_count = isset($input['guest_count']) ? intval($input['guest_count']) : 1;

        $pkg_stmt = safe_prepare($conn, "SELECT price, duration_days FROM tour_packages WHERE id = ?");
        $pkg_stmt->bind_param('i', $package_id);
        $pkg_stmt->execute();
        $pkg = $pkg_stmt->get_result()->fetch_assoc();
        if (!$pkg)
            json_exit(['success' => false, 'error' => 'Package not found'], 404);

        $package_price = (float) $pkg['price'];
        // If an offer_id is provided, attempt to apply discount to package price
        if (isset($input['offer_id']) && !empty($input['offer_id'])) {
            $offer_id = intval($input['offer_id']);
            // ensure the offer applies to this package
            $chk = $conn->prepare("SELECT 1 FROM package_offers WHERE package_id = ? AND offer_id = ?");
            $chk->bind_param('ii', $package_id, $offer_id);
            $chk->execute();
            $g = $chk->get_result()->fetch_assoc();
            if ($g) {
                $ofstmt = safe_prepare($conn, "SELECT discount_type, discount_value FROM offers WHERE id = ?");
                $ofstmt->bind_param('i', $offer_id);
                $ofstmt->execute();
                $of = $ofstmt->get_result()->fetch_assoc();
                if ($of) {
                    $dtype = $of['discount_type'];
                    $dval = (float) $of['discount_value'];
                    if ($dtype === 'percentage') {
                        $package_price = $package_price * (1 - ($dval / 100.0));
                    } else {
                        $package_price = max(0.0, $package_price - $dval);
                    }
                }
            }
        }
        $status = 'pending';

        // capture optional guide_id
        $guide_id = isset($input['guide_id']) ? (is_null($input['guide_id']) ? null : intval($input['guide_id'])) : null;

        // If user also selected hotel & rooms for this package (package + hotel)
        if (!empty($input['hotel_id'])) {
            // hotel selected for this package booking. room_ids may be provided
            // but if not provided we will fetch the predefined rooms mapped for this package+hotel
            $check_in = $input['check_in'] ?? null;
            $check_out = $input['check_out'] ?? null;
            $nights = 0;
            if (!empty($check_in) && !empty($check_out)) {
                try {
                    $ci = new DateTime($check_in);
                    $co = new DateTime($check_out);
                    $nights = $ci->diff($co)->days;
                    if ($nights < 0)
                        $nights = 0;
                } catch (Exception $e) {
                    $nights = isset($input['nights']) ? intval($input['nights']) : 0;
                }
            } else {
                $nights = isset($input['nights']) ? intval($input['nights']) : 0;
            }
            $hotel_id = intval($input['hotel_id']);
            $room_ids = isset($input['room_ids']) ? $input['room_ids'] : [];

            // If client did not supply explicit room_ids, load mapped rooms from package_hotel_rooms
            if ((!is_array($room_ids) || count($room_ids) === 0)) {
                $map = safe_prepare($conn, "SELECT room_id FROM package_hotel_rooms WHERE package_id = ? AND hotel_id = ? ORDER BY id ASC");
                $map->bind_param('ii', $package_id, $hotel_id);
                $map->execute();
                $mr = $map->get_result();
                $room_ids = [];
                while ($rr = $mr->fetch_assoc()) {
                    $room_ids[] = intval($rr['room_id']);
                }
                if (count($room_ids) === 0) {
                    json_exit(['success' => false, 'error' => 'No rooms preselected for this package and hotel.'], 400);
                }
            }

            if (!is_array($room_ids) || count($room_ids) === 0)
                json_exit(['success' => false, 'error' => 'room_ids required for hotel inside package'], 400);
            // prepare nights value (compute from dates if provided) and then use hotel booking flow to calculate total_amount and validate capacity
            $check_in = $input['check_in'] ?? null;
            $check_out = $input['check_out'] ?? null;
            // compute nights if checkin/out provided
            $nights = 0;
            if (!empty($check_in) && !empty($check_out)) {
                try {
                    $ci = new DateTime($check_in);
                    $co = new DateTime($check_out);
                    $nights = $ci->diff($co)->days;
                    if ($nights < 0)
                        $nights = 0;
                } catch (Exception $e) {
                    $nights = isset($input['nights']) ? intval($input['nights']) : 0;
                }
            } else {
                $nights = isset($input['nights']) ? intval($input['nights']) : 0;
            }

            // compute room sums
            $placeholders = implode(',', array_fill(0, count($room_ids), '?'));
            $types = str_repeat('i', count($room_ids));
            $params = array_map('intval', $room_ids);

            $sql = "SELECT SUM(max_guests) AS max_capacity, SUM(price_per_night) AS total_price FROM rooms WHERE id IN ($placeholders)";
            $stmt = safe_prepare($conn, $sql);

            $bind = [];
            $bind[] = $types;
            foreach ($params as $k => $v)
                $bind[] = &$params[$k];
            call_user_func_array([$stmt, 'bind_param'], $bind);
            $stmt->execute();
            $room_data = $stmt->get_result()->fetch_assoc();
            if (!$room_data)
                json_exit(['success' => false, 'error' => 'Rooms not found'], 400);

            $max_capacity = (int) $room_data['max_capacity'];
            $room_total = (float) $room_data['total_price'];
            // multiply by nights to reflect total room cost across duration
            if ($nights > 0)
                $room_total = $room_total * $nights;

            if ($guest_count > $max_capacity)
                json_exit(['success' => false, 'error' => "Guest limit exceeded! Max allowed: $max_capacity"], 400);
            // total_amount = package price + rooms price (rooms price already multiplied by nights)
            $total_amount = $package_price + $room_total;
            // if guide selected, fetch guide rate and add guide fee (rate_per_day * days)
            $guide_fee = 0.0;
            if ($guide_id !== null) {
                $gstmt = safe_prepare($conn, "SELECT rate_per_day FROM guides WHERE id = ?");
                $gstmt->bind_param('i', $guide_id);
                $gstmt->execute();
                $g = $gstmt->get_result()->fetch_assoc();
                if (!$g)
                    json_exit(['success' => false, 'error' => 'Selected guide not found'], 400);
                $rate = (float) $g['rate_per_day'];
                $guide_days = $nights > 0 ? $nights : (isset($pkg['duration_days']) ? intval($pkg['duration_days']) : 1);
                $guide_fee = $rate * $guide_days;
                $total_amount += $guide_fee;
            }

            // Insert booking with package_id and hotel_id (include guide_id if provided)
            if ($guide_id !== null) {
                $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, hotel_id, package_id, total_amount, status, check_in, check_out, nights, guest_count, guide_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            } else {
                $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, hotel_id, package_id, total_amount, status, check_in, check_out, nights, guest_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            }
            $check_in = $input['check_in'] ?? null;
            $check_out = $input['check_out'] ?? null;
            if ($guide_id !== null) {
                $ins->bind_param('iiidsssiii', $user_id, $hotel_id, $package_id, $total_amount, $status, $check_in, $check_out, $nights, $guest_count, $guide_id);
            } else {
                $ins->bind_param('iiidsssii', $user_id, $hotel_id, $package_id, $total_amount, $status, $check_in, $check_out, $nights, $guest_count);
            }
            if (!$ins->execute())
                json_exit(['success' => false, 'error' => $ins->error], 500);
            $booking_id = $conn->insert_id;

            // Insert booking_items per room
            $bi_stmt = safe_prepare($conn, "INSERT INTO booking_items (booking_id, room_id, price_per_night) VALUES (?, ?, (SELECT price_per_night FROM rooms WHERE id = ?))");
            foreach ($room_ids as $rid) {
                $rid = intval($rid);
                $bi_stmt->bind_param('iii', $booking_id, $rid, $rid);
                if (!$bi_stmt->execute()) {
                    // cleanup
                    $conn->query("DELETE FROM booking_items WHERE booking_id = " . intval($booking_id));
                    $conn->query("DELETE FROM bookings WHERE id = " . intval($booking_id));
                    json_exit(['success' => false, 'error' => 'Failed adding booking item: ' . $bi_stmt->error], 500);
                }
            }

            json_exit(['success' => true, 'message' => 'Package + hotel booking created', 'id' => $booking_id], 201);
        }

        // If only package (no hotel)
        if ($guide_id !== null) {
            $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, package_id, total_amount, status, guest_count, guide_id) VALUES (?, ?, ?, ?, ?, ?)");
            // include guide fee into total_amount
            $guide_fee = 0.0;
            $pkg_days = isset($pkg['duration_days']) ? intval($pkg['duration_days']) : 1;
            $gstmt = safe_prepare($conn, "SELECT rate_per_day FROM guides WHERE id = ?");
            $gstmt->bind_param('i', $guide_id);
            $gstmt->execute();
            $g = $gstmt->get_result()->fetch_assoc();
            if (!$g)
                json_exit(['success' => false, 'error' => 'Selected guide not found'], 400);
            $rate = (float) $g['rate_per_day'];
            $guide_fee = $rate * $pkg_days;
            $total_with_guide = $package_price + $guide_fee;
            $ins->bind_param('iidsii', $user_id, $package_id, $total_with_guide, $status, $guest_count, $guide_id);
        } else {
            $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, package_id, total_amount, status, guest_count) VALUES (?, ?, ?, ?, ?)");
            $ins->bind_param('iidsi', $user_id, $package_id, $package_price, $status, $guest_count);
        }
        if ($ins->execute()) {
            json_exit(['success' => true, 'message' => 'Package booking created', 'id' => $conn->insert_id], 201);
        } else {
            json_exit(['success' => false, 'error' => $ins->error], 500);
        }
    }

    // Hotel booking only (no package)
    $required = ['hotel_id', 'check_in', 'check_out', 'room_ids'];
    foreach ($required as $r)
        if (!isset($input[$r]))
            json_exit(['success' => false, 'error' => "Missing required field: $r"], 400);

    $hotel_id = intval($input['hotel_id']);
    $check_in = $input['check_in'];
    $check_out = $input['check_out'];
    $guest_count = isset($input['guest_count']) ? intval($input['guest_count']) : 1;
    $room_ids = $input['room_ids'];

    if (!is_array($room_ids) || count($room_ids) === 0)
        json_exit(['success' => false, 'error' => 'room_ids must be a non-empty array'], 400);

    try {
        $ci = new DateTime($check_in);
        $co = new DateTime($check_out);
    } catch (Exception $e) {
        json_exit(['success' => false, 'error' => 'Invalid date format (YYYY-MM-DD)'], 400);
    }
    $nights = $ci->diff($co)->days;
    if ($nights <= 0)
        json_exit(['success' => false, 'error' => 'Check-out must be after check-in'], 400);

    $placeholders = implode(',', array_fill(0, count($room_ids), '?'));
    $types = str_repeat('i', count($room_ids));
    $params = array_map('intval', $room_ids);

    $sql = "SELECT SUM(max_guests) AS max_capacity, SUM(price_per_night) AS total_price FROM rooms WHERE id IN ($placeholders)";
    $stmt = safe_prepare($conn, $sql);
    $bind = [];
    $bind[] = $types;
    foreach ($params as $k => $v)
        $bind[] = &$params[$k];
    call_user_func_array([$stmt, 'bind_param'], $bind);
    $stmt->execute();
    $room_data = $stmt->get_result()->fetch_assoc();
    if (!$room_data)
        json_exit(['success' => false, 'error' => 'Rooms not found'], 400);

    $max_capacity = (int) $room_data['max_capacity'];
    $total_amount = (float) $room_data['total_price'] * $nights;
    // if a guide is requested for a hotel-only booking, add guide fee based on nights
    $guide_fee = 0.0;
    if (isset($input['guide_id']) && $input['guide_id'] !== null) {
        $hid_guide = intval($input['guide_id']);
        $gstmt = safe_prepare($conn, "SELECT rate_per_day FROM guides WHERE id = ?");
        $gstmt->bind_param('i', $hid_guide);
        $gstmt->execute();
        $g = $gstmt->get_result()->fetch_assoc();
        if (!$g)
            json_exit(['success' => false, 'error' => 'Selected guide not found'], 400);
        $rate = (float) $g['rate_per_day'];
        $guide_fee = $rate * $nights;
        $total_amount += $guide_fee;
        // attach guide id to booking insert below by overwriting/setting variable
        $hotel_guide_id = $hid_guide;
    } else {
        $hotel_guide_id = null;
    }
    if ($guest_count > $max_capacity)
        json_exit(['success' => false, 'error' => "Guest limit exceeded! Max allowed: $max_capacity"], 400);

    $status = 'pending';
    // include guide_id if provided for hotel-only bookings
    if ($hotel_guide_id !== null) {
        $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, hotel_id, total_amount, status, check_in, check_out, nights, guest_count, guide_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->bind_param('iidsssiii', $user_id, $hotel_id, $total_amount, $status, $check_in, $check_out, $nights, $guest_count, $hotel_guide_id);
    } else {
        $ins = safe_prepare($conn, "INSERT INTO bookings (user_id, hotel_id, total_amount, status, check_in, check_out, nights, guest_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ins->bind_param('iidsssii', $user_id, $hotel_id, $total_amount, $status, $check_in, $check_out, $nights, $guest_count);
    }
    if (!$ins->execute())
        json_exit(['success' => false, 'error' => $ins->error], 500);
    $booking_id = $conn->insert_id;

    $bi_stmt = safe_prepare($conn, "INSERT INTO booking_items (booking_id, room_id, price_per_night) VALUES (?, ?, (SELECT price_per_night FROM rooms WHERE id = ?))");
    foreach ($room_ids as $rid) {
        $rid = intval($rid);
        $bi_stmt->bind_param('iii', $booking_id, $rid, $rid);
        if (!$bi_stmt->execute()) {
            $conn->query("DELETE FROM booking_items WHERE booking_id = " . intval($booking_id));
            $conn->query("DELETE FROM bookings WHERE id = " . intval($booking_id));
            json_exit(['success' => false, 'error' => 'Failed adding booking item: ' . $bi_stmt->error], 500);
        }
    }

    json_exit(['success' => true, 'message' => 'Booking created', 'id' => $booking_id], 201);
}

/* PATCH - update status */
if ($method === 'PATCH') {
    if (!isLoggedIn())
        json_exit(['success' => false, 'error' => 'Not logged in'], 401);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']) || !isset($input['status']))
        json_exit(['success' => false, 'error' => 'Missing id or status'], 400);

    $booking_id = intval($input['id']);
    $new_status = $conn->real_escape_string(trim($input['status']));
    $user_id = $_SESSION['user_id'];
    $is_admin = isAdmin();

    $stmt = safe_prepare($conn, "SELECT user_id FROM bookings WHERE id = ?");
    $stmt->bind_param('i', $booking_id);
    $stmt->execute();
    $booking = $stmt->get_result()->fetch_assoc();
    if (!$booking)
        json_exit(['success' => false, 'error' => 'Booking not found'], 404);
    if (!$is_admin && $booking['user_id'] != $user_id)
        json_exit(['success' => false, 'error' => 'Forbidden'], 403);

    $u = safe_prepare($conn, "UPDATE bookings SET status = ? WHERE id = ?");
    $u->bind_param('si', $new_status, $booking_id);
    if (!$u->execute())
        json_exit(['success' => false, 'error' => $u->error], 500);

    json_exit(['success' => true, 'message' => 'Booking updated']);
}

json_exit(['success' => false, 'error' => 'Method not allowed'], 405);