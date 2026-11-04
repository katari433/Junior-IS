from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash
import random
from decimal import Decimal

from .database import engine


app = FastAPI()
password_hash = PasswordHash.recommended()


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

class TransferRequest(BaseModel):
    sender_account_id: int
    recipient_account_num: str
    amount: Decimal

@app.get("/")
def root():
    return {"message": "Banking backend is running"}


@app.get("/db-test")
def test_database():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }

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

    except IntegrityError:
        raise HTTPException(
        status_code=409,
        detail="A user with that email already exists"
    )

@app.post("/login")
def login_user(request: LoginRequest):
    with engine.begin() as connection:
            result = connection.execute(

                text("""
                SELECT id, first_name, last_name, email, password_hash
                FROM users
                WHERE email = :email
                            
                """),
                                {
                "email": request.email
               }
             
            )
            user = result.mappings().first()

            if user is None:
                raise HTTPException(
                    status_code=401,
                    detail= "Invalid Email or Password"
                )
        
            password_hash.verify(
                request.password,
                user["password_hash"]
                )

            if not password_hash.verify(
            request.password,
            user["password_hash"]
            ):
                raise HTTPException(
                status_code=401,
                detail="Invalid Email or Password"
            )

            return {
                "message": "Login successful",
                "user_id": user["id"],
                "first_name": user["first_name"]

            }

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

@app.post("/createAccount")
def create_user_account(request: CreateAccountRequest):
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
        
            return {
               "message": "Account created successfully" 
            }

@app.post("/sendMoney")
def send_money(request: TransferRequest):
        if request.amount <= 0:
            raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

        if len(request.recipient_account_num) != 10:
            raise HTTPException(
                status_code=400,
                detail="Account number must be 10 digits"
            )
        
        if not request.recipient_account_num.isdigit():
            raise HTTPException(
                status_code=400,
                detail="Account number must contain only numbers"
                )
        
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                SELECT id, balance
                FROM accounts
                WHERE id = :id
                
                """),
                {
                "id": request.sender_account_id
                }      
            )
            recipient_result = connection.execute(
            text("""
            SELECT id, balance
            FROM accounts
            WHERE account_num = :account_num
            """),
            {
                "account_num": request.recipient_account_num
            }
            )

            sender = result.mappings().first()
            if sender is None:
                raise HTTPException(
                    status_code=404,
                    detail="Sender account not found"
                )

            
        
            recipient = recipient_result.mappings().first()
            if recipient is None:
                raise HTTPException(
                    status_code=404,
                    detail="Recipient account not found"
                    )

            if sender["id"] == recipient["id"]:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot send money to the same account"
                    )

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
            
            if update.rowcount == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Insufficient funds"
                )

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
            
            

            return {
            "message": "Transfer successful"
            }

    
           