CREATE TABLE destinations (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  rating DECIMAL(3, 1) NOT NULL DEFAULT 4.5,
  hotel_count INT DEFAULT 0,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_info VARCHAR(255),
  highlights TEXT,
  best_time_to_visit VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO destinations
(name, description, image_url, rating, hotel_count, latitude, longitude, location_info, highlights, best_time_to_visit)
VALUES
('Cox''s Bazar', 'Experience the world''s longest natural sandy beach stretching 120 km along the Bay of Bengal. Perfect for sunset views, water sports, and seafood.', 'https://via.placeholder.com/400x300?text=Coxs+Bazar', 4.8, 156, 21.42720000, 92.00580000, 'Chittagong Division, Southeast Bangladesh', 'World''s longest beach, water sports, seafood restaurants, sunsets', 'October - March'),
('Sylhet', 'Discover the tea capital of Bangladesh with rolling green hills, serene tea gardens, and the spiritual beauty of shrines and waterfalls.', 'https://via.placeholder.com/400x300?text=Sylhet', 4.7, 89, 24.89490000, 91.86870000, 'Northeast Bangladesh', 'Tea gardens, waterfalls, shrines, hiking, natural beauty', 'October - February'),
('Bandarban', 'Adventure awaits in the hill district with mountain peaks, tribal culture, Buddhist temples, and breathtaking valley views.', 'https://via.placeholder.com/400x300?text=Bandarban', 4.9, 67, 22.19360000, 92.21630000, 'Chittagong Hill Tracts', 'Mountain peaks, tribal culture, Buddhist temples, trekking, valleys', 'September - April');
