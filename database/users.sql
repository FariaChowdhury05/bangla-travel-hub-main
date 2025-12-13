-- Create users table for authentication
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert admin user (password: admin123)
-- Password hash: $2y$10$dXJ3LjROQkZHT1Jra2pWeO7KqKXzVw3FPb.JJvR3V7KqK7T5W6FfG
INSERT INTO users (email, password, name, role) 
VALUES ('admin@banglatravel.com', '$2y$10$dXJ3LjROQkZHT1Jra2pWeO7KqKXzVw3FPb.JJvR3V7KqK7T5W6FfG', 'Admin User', 'admin');
