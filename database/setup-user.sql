-- ==========================================================
-- Setup Script for MySQL (Run in MySQL Workbench or Command Line)
-- College: New Arts, Commerce and Science College, Ahilyanagar (Autonomous)
-- ==========================================================

-- 1. Set root password to Surajsonawane2004
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Surajsonawane2004';

-- 2. Create the Database if not already present
CREATE DATABASE IF NOT EXISTS hostel_management_db
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON hostel_management_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- 4. Verify
SELECT 'MySQL User & Database configured successfully for Hostel Management System!' AS status;
