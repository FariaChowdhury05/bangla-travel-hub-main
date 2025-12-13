CREATE TABLE hotels (
  id INT NOT NULL AUTO_INCREMENT,
  destination_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  rating DECIMAL(3,1) DEFAULT 4.0,
  address VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_destination (destination_id),
  CONSTRAINT fk_hotels_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example hotels
INSERT INTO hotels (destination_id, name, description, image_url, rating, address, phone) VALUES
(1, 'Sea View Hotel', 'Comfortable hotel near the beach.', 'https://via.placeholder.com/400x250?text=Sea+View+Hotel', 4.5, 'Cox\'s Bazar Beach Road', '+88012345678'),
(1, 'Bay Breeze Inn', 'Cozy inn with ocean views.', 'https://via.placeholder.com/400x250?text=Bay+Breeze+Inn', 4.2, 'Cox\'s Bazar Main', '+88087654321'),
(2, 'Tea Garden Lodge', 'Stay within tea gardens.', 'https://via.placeholder.com/400x250?text=Tea+Garden+Lodge', 4.6, 'Sylhet Tea Garden Road', '+88011223344');
