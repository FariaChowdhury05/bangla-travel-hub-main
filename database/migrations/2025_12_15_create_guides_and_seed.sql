-- Migration: create guides-related tables and seed sample data
START TRANSACTION;

-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  city VARCHAR(100),
  experience_years INT DEFAULT 0,
  bio TEXT,
  rating DECIMAL(3,1) DEFAULT 4.5,
  status ENUM('available','unavailable') DEFAULT 'available',
  rate_per_day DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guide_languages (
  guide_id INT NOT NULL,
  language VARCHAR(100) NOT NULL,
  PRIMARY KEY (guide_id, language),
  CONSTRAINT fk_guide_languages_guide FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guide_destinations (
  guide_id INT NOT NULL,
  destination_id INT NOT NULL,
  PRIMARY KEY (guide_id, destination_id),
  CONSTRAINT fk_gd_guide FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  CONSTRAINT fk_gd_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS package_guides (
  package_id INT NOT NULL,
  guide_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (package_id, guide_id),
  CONSTRAINT fk_pg_package FOREIGN KEY (package_id) REFERENCES tour_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_pg_guide FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add guide_id to bookings if it doesn't exist
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guide_id INT DEFAULT NULL;

-- Optionally add foreign key (commented out if your environment prevents it)
-- ALTER TABLE bookings ADD CONSTRAINT fk_bookings_guide FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE SET NULL;

-- Seed sample guides and package assignments (adjust package ids to match your data)
INSERT INTO guides (name, phone, email, city, experience_years, bio, rating, status, rate_per_day)
VALUES
('Rakib Ahmed', '+8801712345678', 'rakib@example.com', 'Cox\'s Bazar', 8, 'Experienced beach and coastal guide.', 4.9, 'available', 2000.00),
('Fatema Sultana', '+8801812345678', 'fatema@example.com', 'Sylhet', 6, 'Tea garden & nature specialist.', 4.8, 'available', 1800.00),
('Arif Hossain', '+8801912345678', 'arif@example.com', 'Bandarban', 10, 'Expert trekking guide.', 5.0, 'available', 2500.00);

-- Example package assignments (ensure these package ids exist in tour_packages)
-- Assign Rakib (guide id 1) as primary to package 1, Fatema to package 2, Arif to package 3
INSERT INTO package_guides (package_id, guide_id, is_primary) VALUES
(1, 1, TRUE),
(2, 2, TRUE),
(3, 3, TRUE);

COMMIT;
