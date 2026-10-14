-- ==========================================================
-- Online Hostel Management System - Seed Data
-- College: New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
-- ==========================================================

USE hostel_management_db;

-- 1. Insert Hostels
INSERT INTO hostels (id, hostel_name, hostel_type, address, total_rooms, status) VALUES
(1, 'Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह)', 'BOYS', 'North Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001', 10, 'ACTIVE'),
(2, 'Girls Hostel (सावित्रीबाई फुले वसतिगृह)', 'GIRLS', 'South Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001', 10, 'ACTIVE')
ON DUPLICATE KEY UPDATE hostel_name = VALUES(hostel_name);

-- 2. Rooms and Beds are generated automatically by DataInitializer in Spring Boot,
-- or can be initialized here for 10 rooms per hostel, 4 beds per room (B-101 to B-110, G-101 to G-110).
