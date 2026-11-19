from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash
import random
from decimal import Decimal

from .database import engine


# Initialize FastAPI and password hashing
app = FastAPI()
password_hash = PasswordHash.recommended()


# Request models for API input validation
class RegistrationRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class LoginRequest (BaseModel):
    email: str
    password: str

class AccountRequest (BaseModel):
    user_id: int

class CreateAccountRequest(BaseModel):
    user_id: int
    account_name: str

# Use Decimal for monetary amounts
class TransferRequest(BaseModel):
    sender_account_id: int
    recipient_account_num: str
    amount: Decimal

class TransactionHistoryRequest(BaseModel):
     bank_account_id: int

class AdminRequest(BaseModel):
    user_id: int

class FraudReviewRequest(BaseModel):
    user_id: int
    fraud_flag_id: int
    review_status: str

# Check backend status
@app.get("/")
def root():
    return {"message": "Banking backend is running"}


# Test the database connection
@app.get("/db-test")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }

# Register a user and store their hashed password
@app.post("/register")
def register_user(request: RegistrationRequest):
    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO users (
                        first_name,
                        last_name,
                        email,
                        password_hash
                    )
                    VALUES (
                        :first_name,
                        :last_name,
                        :email,
                        :password_hash
                    )
                """),
                {
                    "first_name": request.first_name,
                    "last_name": request.last_name,
                    "email": request.email,
                    "password_hash": password_hash.hash(request.password)
                }
            )

        return {
            "message": "User created successfully",
        }

    # Handle duplicate email registration
    except IntegrityError:
        raise HTTPException(
        status_code=409,
        detail="A user with that email already exists"
    )

# Authenticate a user by email and password
@app.post("/login")
def login_user(request: LoginRequest):
    with engine.begin() as connection:
            result = connection.execute(

                text("""
                SELECT id, first_name, last_name, email, password_hash, role
                FROM users
                WHERE email = :email

                """),
                                {
                "email": request.email
               }

            )
            user = result.mappings().first()

            # Check whether the user exists
            if user is None:
                raise HTTPException(
                    status_code=401,
                    detail= "Invalid Email or Password"
                )

            password_hash.verify(
                request.password,
                user["password_hash"]
                )

            # Verify the password against the stored hash
            if not password_hash.verify(
            request.password,
            user["password_hash"]
            ):
                raise HTTPException(
                status_code=401,
                detail="Invalid Email or Password"
            )


            # Log successful authentication
            connection.execute(
                text("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    details
                )
                VALUES (
                    :user_id,
                    :action,
                    :details
                )
                """),
                {
                    "user_id": user["id"],
                    "action": "LOGIN",
                    "details": "User logged in successfully"
                }
            )

            return {
                "message": "Login successful",
                "user_id": user["id"],
                "first_name": user["first_name"],
                "role": user["role"],

            }

# Retrieve all accounts associated with a user ID
@app.post("/findAccount")
def find_user_account(request: AccountRequest):
    with engine.connect() as connection:
            result = connection.execute(

                text("""
                SELECT id, account_num, user_id, account_name, balance
                FROM accounts
                WHERE user_id = :user_id

                """),
                                {
                "user_id": request.user_id
               }

            )
            accounts = result.mappings().all()

            if not accounts:
                return{
                   "message": "no accounts", 
                   "accounts": []
                }

            return {
                "accounts": accounts

            }

# Create a bank account with an initial balance of zero
@app.post("/createAccount")
def create_user_account(request: CreateAccountRequest):
    # Generate a random 10-digit account number
    account_num = str(random.randint(1000000000, 9999999999))
    with engine.begin() as connection:
            result = connection.execute(
            text("""
                INSERT INTO accounts (
                    account_num,
                    user_id,
                    account_name,
                    balance
                )
                VALUES (
                    :account_num,
                    :user_id,
                    :account_name,
                    :balance
                )
            """),    
            {
            "account_num": account_num,
            "user_id": request.user_id,
            "account_name": request.account_name,
            "balance": 0.00
            }
            )

            # Log account creation
            connection.execute(
                text("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    details
                )
                VALUES (
                    :user_id,
                    :action,
                    :details
                )
                """),
                {
                    "user_id": request.user_id,
                    "action": "ACCOUNT_CREATED",
                    "details": f"{request.account_name} account created"
                }
            )

            return {
               "message": "Account created successfully" 
            }

# Validate and process money transfers
@app.post("/sendMoney")
def send_money(request: TransferRequest):
        # Validate the transfer amount
        if request.amount <= 0:
            raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

        # Validate the account number length
        if len(request.recipient_account_num) != 10:
            raise HTTPException(
                status_code=400,
                detail="Account number must be 10 digits"
            )

        # Validate the account number format
        if not request.recipient_account_num.isdigit():
            raise HTTPException(
                status_code=400,
                detail="Account number must contain only numbers"
                )

        # Process the transfer within a database transaction
        with engine.begin() as connection:
            # Retrieve the sender account
            result = connection.execute(
                text("""
                SELECT id, user_id, account_num, balance
                FROM accounts
                WHERE id = :id

                """),
                {
                "id": request.sender_account_id
                }      
            )

            # Retrieve the recipient account
            recipient_result = connection.execute(
            text("""
            SELECT id, user_id, balance
            FROM accounts
            WHERE account_num = :account_num
            """),
            {
                "account_num": request.recipient_account_num
            }
            )

            # Check whether the sender account exists
            sender = result.mappings().first()
            if sender is None:
                raise HTTPException(
                    status_code=404,
                    detail="Sender account not found"
                )



            # Check whether the recipient account exists
            recipient = recipient_result.mappings().first()
            if recipient is None:
                raise HTTPException(
                    status_code=404,
                    detail="Recipient account not found"
                    )

            # Prevent transfers to the same account
            if sender["id"] == recipient["id"]:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot send money to the same account"
                    )

            # Deduct funds only if the balance is sufficient
            update = connection.execute(
            text("""
            UPDATE accounts
            SET balance = balance - :amount
            WHERE id = :id
            AND balance >= :amount
            """),
            {
            "amount": request.amount,
            "id": sender["id"]
            }
            )

            # Reject the transfer if the deduction fails
            if update.rowcount == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient funds"
                )

            # Credit the recipient account
            connection.execute(
                    text("""
                    UPDATE accounts
                    SET balance = balance + :amount
                    WHERE account_num = :account_num
                    """),
                {
                "account_num": request.recipient_account_num,
                "amount": request.amount
                }
            )

            # Record the transfer in the transactions table
            transaction_result = connection.execute(
                text("""
                    INSERT INTO transactions (
                    sender_account_id,
                    recipient_account_id,
                    amount
                    )
                    VALUES (
                    :sender_account_id,
                    :recipient_account_id,
                    :amount
                    )
                    """),
                {
                    "sender_account_id": sender["id"],
                    "recipient_account_id": recipient["id"],
                    "amount": request.amount
                }
            )

            # Retrieve the newly created transaction ID
            transaction_id = transaction_result.lastrowid

            # Flag transfers of $5,000 or more
            if request.amount >= Decimal("5000.00"):
                connection.execute(
                    text("""
                    INSERT INTO fraud_flags (
                        transaction_id,
                        rule_triggered
                    )
                    VALUES (
                        :transaction_id,
                        :rule_triggered
                    )
                    """),
                    {
                        "transaction_id": transaction_id,
                        "rule_triggered": "HIGH_VALUE_TRANSFER"
                    }
                )

            # Count outgoing transfers in the last 10 minutes
            rapid_transfer_result = connection.execute(
                text("""
                SELECT COUNT(*)
                FROM transactions
                WHERE sender_account_id = :sender_account_id
                AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
                """),
                {
                    "sender_account_id": sender["id"]
                }
            )

            rapid_transfer_count = rapid_transfer_result.scalar()

            # Flag three or more transfers within 10 minutes
            if rapid_transfer_count >= 3:
                connection.execute(
                    text("""
                    INSERT INTO fraud_flags (
                        transaction_id,
                        rule_triggered
                    )
                    VALUES (
                        :transaction_id,
                        :rule_triggered
                    )
                    """),
                    {
                        "transaction_id": transaction_id,
                        "rule_triggered": "RAPID_TRANSFERS"
                    }
                )

            # Log the outgoing transfer
            connection.execute(
                text("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    details
                )
                VALUES (
                    :user_id,
                    :action,
                    :details
                )
                """),
                {
                    "user_id": sender["user_id"],
                    "action": "TRANSFER_SENT",
                    "details": f"Sent ${request.amount} to account {request.recipient_account_num}"
                }
            )

            # Log the incoming transfer
            connection.execute(
                text("""
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    details
                )
                VALUES (
                    :user_id,
                    :action,
                    :details
                )
                """),
                {
                    "user_id": recipient["user_id"],
                    "action": "TRANSFER_RECEIVED",
                    "details": f"Received ${request.amount} from account {sender['account_num']}"
                }
            )


            return {
            "message": "Transfer successful"
            }



# Retrieve incoming and outgoing transactions
@app.post("/transactionHistory")
def transaction_history(request: TransactionHistoryRequest):
    with engine.connect() as connection:
        result = connection.execute(
            text("""
            SELECT id, sender_account_id, recipient_account_id, amount, created_at
            FROM transactions
            WHERE sender_account_id = :bank_account_id
            OR recipient_account_id = :bank_account_id
            ORDER BY created_at DESC
            """),
            {
                "bank_account_id": request.bank_account_id
            }
        )

        transactions = result.mappings().all()

        return {
            "transactions": transactions
        }

# Retrieve audit logs
@app.post("/auditLogs")
def audit_logs(request: AdminRequest):
    with engine.connect() as connection:
        # Retrieve the supplied user's role
        admin_result = connection.execute(
            text("""
            SELECT role
            FROM users
            WHERE id = :user_id
            """),
            {
                "user_id": request.user_id
            }
        )

        admin = admin_result.mappings().first()

        # Require the administrator role
        if admin is None or admin["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )

        # Join audit logs with user information
        result = connection.execute(
            text("""
            SELECT audit_logs.id,
                   audit_logs.user_id,
                   users.first_name,
                   users.last_name,
                   audit_logs.action,
                   audit_logs.details,
                   audit_logs.created_at
            FROM audit_logs
            LEFT JOIN users
                ON audit_logs.user_id = users.id
            ORDER BY audit_logs.created_at DESC
            """)
        )

        logs = result.mappings().all()

        return {
            "logs": logs
        }

# Retrieve flagged transactions
@app.post("/fraudFlags")
def fraud_flags(request: AdminRequest):
    with engine.connect() as connection:
        # Retrieve the supplied user's role
        admin_result = connection.execute(
            text("""
            SELECT role
            FROM users
            WHERE id = :user_id
            """),
            {
                "user_id": request.user_id
            }
        )

        admin = admin_result.mappings().first()

        # Require the administrator role
        if admin is None or admin["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )

        # Join fraud flags with transaction details
        result = connection.execute(
            text("""
            SELECT fraud_flags.id,
                   fraud_flags.transaction_id,
                   fraud_flags.rule_triggered,
                   fraud_flags.review_status,
                   fraud_flags.created_at,
                   transactions.sender_account_id,
                   transactions.recipient_account_id,
                   transactions.amount
            FROM fraud_flags
            JOIN transactions
                ON fraud_flags.transaction_id = transactions.id
            ORDER BY fraud_flags.created_at DESC
            """)
        )

        flags = result.mappings().all()

        return {
            "flags": flags
        }

# Review flagged transactions
@app.post("/reviewFraudFlag")
def review_fraud_flag(request: FraudReviewRequest):
    with engine.begin() as connection:
        # Retrieve the supplied user's role
        admin_result = connection.execute(
            text("""
            SELECT role
            FROM users
            WHERE id = :user_id
            """),
            {
                "user_id": request.user_id
            }
        )

        admin = admin_result.mappings().first()

        # Require the administrator role
        if admin is None or admin["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Admin access required"
            )

        # Validate the requested review status
        if request.review_status not in ["fraud", "legitimate"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid review status"
            )

        # Update the fraud flag's review status
        result = connection.execute(
            text("""
            UPDATE fraud_flags
            SET review_status = :review_status
            WHERE id = :fraud_flag_id
            """),
            {
                "review_status": request.review_status,
                "fraud_flag_id": request.fraud_flag_id
            }
        )

        # Check whether the update affected a row
        if result.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Fraud flag not found"
            )

        return {
            "message": "Fraud flag reviewed successfully"
        }