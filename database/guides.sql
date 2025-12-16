-- Guides schema and relations
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
  CONSTRAINT fk_guide_languages_guide
    FOREIGN KEY (guide_id) REFERENCES guides(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS guide_destinations (
  guide_id INT NOT NULL,
  destination_id INT NOT NULL,
  PRIMARY KEY (guide_id, destination_id),
  CONSTRAINT fk_gd_guide
    FOREIGN KEY (guide_id) REFERENCES guides(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_gd_destination
    FOREIGN KEY (destination_id) REFERENCES destinations(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS package_guides (
  package_id INT NOT NULL,
  guide_id INT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (package_id, guide_id),
  CONSTRAINT fk_pg_package
    FOREIGN KEY (package_id) REFERENCES tour_packages(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pg_guide
    FOREIGN KEY (guide_id) REFERENCES guides(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alter bookings to include guide_id (if not already present)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guide_id INT DEFAULT NULL;

-- Note: Add foreign key manually if desired in your DB environment
-- ALTER TABLE bookings
--   ADD CONSTRAINT fk_bookings_guide FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE SET NULL;
