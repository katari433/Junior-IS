-- Insert test users with placeholder password hashes
INSERT INTO users (first_name, last_name, email, password_hash)
VALUES ('Test', 'User', 'testuser1@example.com', 'TEMP_HASH');

INSERT INTO users (first_name, last_name, email, password_hash)
VALUES ('Sample', 'User', 'testuser2@example.com', 'TEMP_HASH');

-- Create test accounts with initial balances
INSERT INTO accounts (account_num, user_id, account_name, balance)
VALUES (
    '0381947261',
    (SELECT id FROM users WHERE email = 'testuser1@example.com'),
    'Checking',
    1000.00
);

INSERT INTO accounts (account_num, user_id, account_name, balance)
VALUES (
    '5729041836',
    (SELECT id FROM users WHERE email = 'testuser1@example.com'),
    'Savings',
    2500.00
);

INSERT INTO accounts (account_num, user_id, account_name, balance)
VALUES (
    '8416302754',
    (SELECT id FROM users WHERE email = 'testuser2@example.com'),
    'Checking',
    1500.00
);

INSERT INTO accounts (account_num, user_id, account_name, balance)
VALUES (
    '8416302764',
    (SELECT id FROM users WHERE email = 'tim1@gmail.com'),
    'Checking',
    10500.00
);

-- Update an account balance for testing
UPDATE accounts
SET balance = 1000.00
WHERE account_num = '1464955414';

-- Check the database server time
SELECT NOW();

-- Add user roles with customer as the default
ALTER TABLE users
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer';

-- Assign the administrator role
UPDATE users
SET role = 'admin'
WHERE email = 'admin@gmail.com';

-- Create the audit logging table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);