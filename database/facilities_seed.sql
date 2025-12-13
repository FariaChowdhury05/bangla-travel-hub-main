-- facilities_seed.sql
-- Wrap with FK checks disabled for safe import
SET FOREIGN_KEY_CHECKS=0;

INSERT IGNORE INTO facilities (name, description) VALUES
('Free WiFi', 'High-speed wireless internet'),
('Free Parking', 'On-site parking available'),
('Swimming Pool', 'Outdoor pool available'),
('Breakfast Included', 'Complimentary breakfast'),
('Airport Shuttle', 'Paid shuttle service'),
('24/7 Front Desk', 'Reception open 24 hours');

SET FOREIGN_KEY_CHECKS=1;
