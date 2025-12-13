-- Create Reviews Database
CREATE DATABASE IF NOT EXISTS bangla_travel_hub;

USE bangla_travel_hub;

-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    tour VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional - for testing)
INSERT INTO reviews (name, location, rating, comment, tour, status) VALUES
('Sarah Ahmed', 'Dhaka', 5, 'Amazing experience! The tour guide was knowledgeable and the hotels were top-notch. Highly recommend!', "Cox's Bazar Beach Paradise", 'approved'),
('Michael Chen', 'Singapore', 5, 'The tea gardens in Sylhet were breathtaking. Everything was well organized and the service was excellent.', 'Sylhet Tea Garden Tour', 'approved'),
('Priya Sharma', 'Mumbai', 4, 'Wonderful trekking experience in Bandarban. The hills are beautiful and the guide was very helpful.', 'Bandarban Hill Adventure', 'approved'),
('James Wilson', 'London', 5, 'Best vacation ever! Bangladesh is a hidden gem. The hospitality and beauty exceeded all expectations.', "Cox's Bazar Beach Paradise", 'approved');
