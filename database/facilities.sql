-- facilities.sql
-- Create facilities master table and hotel_facilities mapping
CREATE TABLE IF NOT EXISTS facilities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hotel_facilities (
  hotel_id INT NOT NULL,
  facility_id INT NOT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (hotel_id, facility_id),
  KEY idx_facility (facility_id),
  CONSTRAINT fk_hf_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  CONSTRAINT fk_hf_facility FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
