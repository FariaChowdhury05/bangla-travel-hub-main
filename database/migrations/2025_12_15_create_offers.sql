-- Migration: create offers and package_offers
START TRANSACTION;

CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type ENUM('percentage','flat') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active','inactive') DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS package_offers (
  package_id INT NOT NULL,
  offer_id INT NOT NULL,
  PRIMARY KEY (package_id, offer_id),
  CONSTRAINT fk_po_package FOREIGN KEY (package_id) REFERENCES tour_packages(id) ON DELETE CASCADE,
  CONSTRAINT fk_po_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
