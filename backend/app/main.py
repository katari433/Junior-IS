from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from .database import engine


app = FastAPI()

class RegistrationRequest(BaseModel):
    first_name: str
    last_name: str
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
                    "password_hash": "TEMP_HASH"
                }
            )

        return {
            "message": "User created successfully",
            "user_id": result.lastrowid,
            "email": request.email
        }

    except IntegrityError:
        raise HTTPException(
        status_code=409,
        detail="A user with that email already exists"
    )
