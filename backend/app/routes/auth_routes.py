# app/routes/auth_routes.py

from fastapi import APIRouter, HTTPException, Depends, Request, status
from app.database import users_collection
from app.auth import hash_password, verify_password, create_access_token
from app.models import UserRegister, UserLogin, TokenResponse
from app.config import SECRET_KEY, ALGORITHM
from bson import ObjectId
import jwt

router = APIRouter()


# ---------------------------
# JWT Dependency: Get Current User
# ---------------------------
def get_current_user(request: Request):
    """
    Reads Authorization header, verifies JWT, and returns current user
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )

    try:
        token = auth_header.split(" ")[1]  # Expected: Bearer <token>
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Return only the fields we need
        return {"name": user["name"], "email": user["email"], "_id": str(user["_id"])}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


# ---------------------------
# User Registration
# ---------------------------
@router.post("/register")
def register(user: UserRegister):
    """
    Register a new user
    """
    # Check if email already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    # Hash password
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)

    # Insert into DB
    users_collection.insert_one(user_dict)

    return {"message": "User registered successfully"}


# ---------------------------
# User Login
# ---------------------------
@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin):
    """
    Login user and return JWT token
    """
    db_user = users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    # Create JWT token
    token = create_access_token({"id": str(db_user["_id"])})

    return {"access_token": token, "token_type": "bearer"}


# ---------------------------
# Get Current Profile
# ---------------------------
@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current logged-in user's profile
    """
    return {"name": current_user["name"], "email": current_user["email"]}
