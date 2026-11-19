# Design and Implementation of a Secure Mobile Banking Application

## Overview

This project is a mobile banking application developed as part of my Junior Independent Study in Computer Science at The College of Wooster.

The application simulates core banking operations, with an emphasis on transaction reliability, database management, security, and fraud detection. It provides separate interfaces for customers and administrators.

## Features

### Customer Features

- User registration and login
- Checking and savings account creation
- Account balance and account details
- Sending money to other bank accounts
- Transfers between personal accounts
- Transaction history
- Transfer validation and error handling

### Administrator Features

- Administrator dashboard
- Viewing system audit logs
- Viewing flagged transactions
- Reviewing potentially fraudulent transactions
- Classifying transactions as fraudulent or legitimate

## Technologies Used

| Technology | Purpose |
|---|---|
| React Native | Mobile application interface |
| Expo | Mobile development environment |
| TypeScript | Frontend development |
| Python | Backend development |
| FastAPI | REST API development |
| SQLAlchemy | Database communication |
| MySQL | Relational database management |
| Docker | Containerization |
| DataGrip | Database management |
| Git and GitHub | Version control |

## System Architecture

The application uses a three-tier architecture:

1. **Frontend:** A React Native mobile application that handles user interaction and communicates with the backend through HTTP requests.
2. **Backend:** A FastAPI application that handles business logic, authentication, validation, transaction processing, and fraud detection.
3. **Database:** A MySQL relational database that stores user information, bank accounts, transactions, audit logs, and fraud flags.

The backend and database run in separate Docker containers.

## Database Design

The database consists of five main tables:

| Table | Description |
|---|---|
| `users` | Stores user information, password hashes, and roles |
| `accounts` | Stores bank account information and balances |
| `transactions` | Records transfers between accounts |
| `audit_logs` | Records important user activities |
| `fraud_flags` | Stores flagged transactions and review statuses |

Primary keys, foreign keys, and unique constraints are used to maintain data integrity.

## Security

The application implements the following security measures:

- Password hashing using pwdlib
- Password verification during login
- Customer and administrator role checks
- Parameterized SQL queries
- Frontend and backend input validation
- Database credentials stored in environment variables
- Audit logging of important user activities

## Transaction Management

Money transfers are processed within database transactions to maintain atomicity and consistency.

Each successful transfer includes:

1. Validation of the sender and recipient accounts.
2. Verification of sufficient funds.
3. Deduction from the sender's balance.
4. Addition to the recipient's balance.
5. Creation of a transaction record.
6. Evaluation of fraud detection rules.
7. Creation of audit log records.

If an exception occurs during processing, the database transaction is rolled back.

## Transfer Validation

The application rejects transfers involving:

- Zero or negative amounts
- Invalid account number formats
- Nonexistent accounts
- Transfers to the same account
- Insufficient funds

## Fraud Detection

The application uses rule-based fraud detection to identify potentially suspicious transactions.

| Rule | Condition |
|---|---|
| HIGH_VALUE_TRANSFER | Transfer amount is $5,000 or greater |
| RAPID_TRANSFERS | Three or more outgoing transfers within 10 minutes |

Flagged transactions are recorded in the database for administrator review. Administrators can classify each pending flag as fraudulent or legitimate.

Flagging a transaction does not automatically prevent or reverse it.

## Audit Logging

The application records the following activities:

- Successful user login
- Bank account creation
- Outgoing transfers
- Incoming transfers

Administrators can access these records through the audit logs screen.

## Project Structure

```text
banking-app/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── database.py
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   ├── schema.sql
│   └── seed.sql
├── mobile/
│   ├── App.tsx
│   ├── styles.ts
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Installation and Setup

### Prerequisites

- Docker Desktop
- Node.js and npm
- DataGrip or another MySQL client
- Xcode and iOS Simulator

### 1. Clone the Repository

```bash
git clone https://github.com/katari433/Junior-IS.git
cd Junior-IS
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory.

```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=banking_db
MYSQL_USER=banking_user
MYSQL_PASSWORD=your_password
```

The `.env` file should not be committed to GitHub.

### 3. Start the Backend and Database

```bash
docker compose up -d --build
```

The backend runs on:

```text
http://localhost:8000
```

The MySQL database runs on port `3306`.

### 4. Initialize the Database

Connect to the MySQL database using DataGrip and create the tables using the SQL statements in the `database` directory.

Ensure the users table includes the role column and that each table is created only once.

The seed file contains sample data and SQL statements used during development and testing.

### 5. Start the Mobile Application

```bash
cd mobile
npm install
npx expo start
```

Press `i` to launch the application in the iOS Simulator.

### 6. Create an Administrator

Register a user through the mobile application and assign the administrator role through MySQL.

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your_admin_email';
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check backend status |
| GET | `/db-test` | Test database connection |
| POST | `/register` | Register a user |
| POST | `/login` | Authenticate a user |
| POST | `/findAccount` | Retrieve user accounts |
| POST | `/createAccount` | Create a bank account |
| POST | `/sendMoney` | Process a money transfer |
| POST | `/transactionHistory` | Retrieve transaction history |
| POST | `/auditLogs` | Retrieve audit logs |
| POST | `/fraudFlags` | Retrieve flagged transactions |
| POST | `/reviewFraudFlag` | Update fraud review status |

Interactive API documentation is available at:

```text
http://localhost:8000/docs
```

## Current Limitations

- The application is designed for local development and demonstration.
- Fraud detection is limited to predefined rules.
- API authorization currently relies on supplied user IDs rather than secure authentication tokens.
- The application does not integrate with real banking institutions or payment networks.
- The application is not intended for production banking use.

## Future Work

- Two-factor authentication
- Temporary account lockout
- Fraud alert notifications
- Token-based authentication and account ownership verification
- Spending breakdown and analytics
- More advanced fraud detection techniques
- Expanded automated testing

## Author

Katari Alhassan

Computer Science

The College of Wooster

Junior Independent Study — Fall 2026


# Feature Calendar
| Feature / Task | Due Date | Notes |
|---|---|---|
| Create user database | September 29, 2026 | 0.5 hours |
| Create account database | September 29, 2026 | 0.5 hours |
| Create test accounts | September 30, 2026 | 2 hours |
| User registration page | October 1, 2026 | 1 hour |
| Login page | October 2, 2026 | 0.5 hours |
| Password hashing | October 3, 2026 | 1 hour |
| Main dashboard | October 5, 2026 | 0.5 hours |
| Account page | October 6, 2026 | 0.5 hours |
| Send money page | October 7, 2026 | 0.5 hours |
| Transfer validation | October 8, 2026 | 1 hour |
| Reliable transfer processing | October 10, 2026 | 1 hour |
| Transaction history | October 12, 2026 | 1 hour |
| Audit logging | October 14, 2026 | 3 hours |
| Fraud detection rules | October 17, 2026 | 5 hours |
| Fraud review page | October 20, 2026 | 5 hours |
| Application testing | October 21, 2026 | 1 hour |
| Two-factor authentication *(Stretch Goal)* | if time permits | 0.5 hours |
| Temporary account lockout *(Stretch Goal)* | if time permits | 2 hours |
| Fraud-alert notifications *(Stretch Goal)* | if time permits | 0.5 hours |
| Spending breakdown *(Stretch Goal)* | if time permits | 1.5 hours |
```
