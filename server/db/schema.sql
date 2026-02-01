-- Investment Dashboard Database Schema

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset ENUM('SP500', 'BITCOIN') NOT NULL,
  transaction_date DATETIME NOT NULL,
  amount_usd DECIMAL(15,2) NOT NULL,
  price_at_purchase DECIMAL(20,8) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  is_fallback_price TINYINT(1) DEFAULT 0,
  -- Banco Nacional fields (optional)
  participation_value DECIMAL(22,10) DEFAULT NULL,
  number_of_participations DECIMAL(22,10) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_asset (asset),
  INDEX idx_date (transaction_date)
);

-- Settings table (single row for app settings)
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  annual_commission_percent DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO settings (id, annual_commission_percent) VALUES (1, 0.00)
ON DUPLICATE KEY UPDATE id = id;
