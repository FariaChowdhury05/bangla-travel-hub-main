-- bookings: master record (supports both hotel and tour package bookings)
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  hotel_id INT NULL,
  package_id INT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  check_in DATE NULL,
  check_out DATE NULL,
  nights INT NULL,
  guest_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY (user_id),
  KEY (hotel_id),
  KEY (package_id),
  CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_package FOREIGN KEY (package_id) REFERENCES tour_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT check_booking_type CHECK ((hotel_id IS NOT NULL AND package_id IS NULL) OR (hotel_id IS NULL AND package_id IS NOT NULL))
);
