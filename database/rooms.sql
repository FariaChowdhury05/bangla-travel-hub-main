-- rooms: inventory
-- IMPORTANT: Ensure `database/hotels.sql` is imported BEFORE this file.
-- Import order recommendation: destinations.sql -> hotels.sql -> rooms.sql
-- If you must import out-of-order, run the INSERTs with foreign key checks disabled,
-- or run the three files in the order above to avoid FK constraint errors.
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  room_number VARCHAR(64),
  type VARCHAR(100) DEFAULT 'standard',
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  max_guests INT DEFAULT 2,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY (hotel_id),
  CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Sample rooms data
-- The INSERTs below assume hotels with IDs 1,2,3 exist. If your hotels have different IDs
-- either adjust the hotel_id values or import `hotels.sql` first. To avoid FK failures when
-- loading sample data, the INSERTs are wrapped with foreign key checks toggled off.
SET FOREIGN_KEY_CHECKS=0;
INSERT INTO rooms (hotel_id, room_number, type, price_per_night, max_guests, description) VALUES
(1, '101', 'standard', 50.00, 2, 'Comfortable room with sea view'),
(1, '102', 'deluxe', 75.00, 3, 'Spacious deluxe room with balcony'),
(1, '103', 'suite', 120.00, 4, 'Luxury suite with premium amenities'),
(2, '201', 'standard', 40.00, 2, 'Cozy room with garden view'),
(2, '202', 'deluxe', 65.00, 3, 'Modern deluxe room with tea facilities'),
(3, '301', 'standard', 35.00, 2, 'Mountain view room');
SET FOREIGN_KEY_CHECKS=1;
