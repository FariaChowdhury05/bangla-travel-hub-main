-- Create junction table mapping tour_package -> hotel -> room
CREATE TABLE IF NOT EXISTS package_hotel_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  hotel_id INT NOT NULL,
  room_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_package_hotel_room (package_id, hotel_id, room_id),
  INDEX idx_package_hotel (package_id, hotel_id),
  CONSTRAINT fk_phr_package FOREIGN KEY (package_id) REFERENCES tour_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_phr_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT fk_phr_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
