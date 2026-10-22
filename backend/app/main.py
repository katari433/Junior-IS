from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

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


