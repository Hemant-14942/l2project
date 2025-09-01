from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime


class BaseDocument(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RegisterModel(BaseDocument):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=3, max_length=20)

    # @validator("password")
    # def strong_password(cls, v):
    #     pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
    #     if not re.match(pattern, v):
    #         raise ValueError("❌ Password must have at least 8 characters, with one uppercase, one lowercase, and one number.")
    #     return v

class LoginModel(BaseDocument):
    email: EmailStr
    password: str = Field(..., min_length=3, max_length=20)


class SessionModel(BaseDocument):
    user: str  # user ID as string
    valid: bool = True
    user_agent: Optional[str] = None
    ip: Optional[str] = None