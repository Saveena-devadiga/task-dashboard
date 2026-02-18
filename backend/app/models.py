from pydantic import BaseModel, EmailStr
from typing import Optional


# 👤 User Register Model
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


# 🔐 User Login Model
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 📝 Task Model
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None


# 📤 Response Model (optional)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
