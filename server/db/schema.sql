-- Investment Dashboard Database Schema

-- Drop existing tables to recreate with user_id (order matters due to foreign keys)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS settings;

-- Users table for Google OAuth (must exist first for foreign keys)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture VARCHAR(500),
  refresh_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_google_id (google_id),
  INDEX idx_email (email)
);

-- Transactions table (per-user)
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  asset ENUM('SP500', 'BITCOIN') NOT NULL,
  transaction_date DATETIME NOT NULL,
  amount_usd DECIMAL(15,2) NOT NULL,
  price_at_purchase DECIMAL(20,8) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  is_fallback_price TINYINT(1) DEFAULT 0,
  participation_value DECIMAL(22,10) DEFAULT NULL,
  number_of_participations DECIMAL(22,10) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_asset (asset),
  INDEX idx_date (transaction_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings table (per-user)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  annual_commission_percent DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
