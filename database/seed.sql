INSERT INTO users (first_name, last_name, email, password_hash)
VALUES ('Test', 'User', 'testuser1@example.com', 'TEMP_HASH');

INSERT INTO users (first_name, last_name, email, password_hash)
VALUES ('Sample', 'User', 'testuser2@example.com', 'TEMP_HASH');

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