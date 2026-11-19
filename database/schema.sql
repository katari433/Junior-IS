-- Store user information and hashed passwords
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Store bank accounts and their balances
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_num CHAR(10) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    account_name VARCHAR(500) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id)

);

-- Record transfers between bank accounts
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_account_id INT NOT NULL,
    recipient_account_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_account_id) REFERENCES accounts(id),
    FOREIGN KEY (recipient_account_id) REFERENCES accounts(id)
);


-- Record user actions for auditing
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Store flagged transactions and their review status
CREATE TABLE fraud_flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    rule_triggered VARCHAR(100) NOT NULL,
    review_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Add review status to an existing fraud flags table
ALTER TABLE fraud_flags
ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'pending';