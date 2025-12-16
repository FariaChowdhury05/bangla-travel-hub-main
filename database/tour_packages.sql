-- tour_packages.sql
CREATE TABLE IF NOT EXISTS tour_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_days INT DEFAULT 1,
  -- Meals and logistics
  breakfast TINYINT(1) DEFAULT 0,
  lunch TINYINT(1) DEFAULT 0,
  dinner TINYINT(1) DEFAULT 0,
  transport VARCHAR(255) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS package_destinations (
  package_id INT NOT NULL,
  destination_id INT NOT NULL,
  sequence INT DEFAULT 1,       -- order of visit
  PRIMARY KEY (package_id, destination_id),
  CONSTRAINT fk_pkg_dest_pkg FOREIGN KEY (package_id)
      REFERENCES tour_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_pkg_dest_dest FOREIGN KEY (destination_id)
      REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
