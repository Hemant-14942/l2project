import json,time
import os
import requests
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordBearer
from starlette.responses import JSONResponse
from starlette.requests import Request
from jwt_utils.auth import create_access_token, decode_token
from utils_fold.auth_utils import verify_password, hash_password

from model.user_model import RegisterModel , LoginModel , SessionModel
import config_fold.db as db
from middleware.auth_middleware import verify_auth, soft_verify_auth

from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/user", tags=["User"])

@router.post("/register")
async def register_user(request: Request, user: RegisterModel):
    # Extract the user data from the request body
    user_data = user.dict()
    print("user data", user_data)
    # checking if the user exist
    user_exist = await db.user_collection.find_one({"email": user_data["email"]})
    print(" checking if the user exist", user_exist)
    if  user_exist:
        raise HTTPException(status_code=409, detail="user already exists with this email")
    hashed_password = hash_password(user_data["password"])

    # update the user data with the hashed password
    user_data["password"] = hashed_password

    # Save the user data to the database or perform any other necessary actions
    result = await db.user_collection.insert_one(user_data)
    # print(str(result.inserted_id))
    user_id = str(result.inserted_id)

    # Create a new session
    session = SessionModel(
        user=user_id,
        user_agent=request.headers.get("User-Agent"),
        ip=request.client.host
    )
    # Save the session to the database 
    session_result = await db.session_collection.insert_one(session.dict())

    session_id = str(session_result.inserted_id)
    # print("session id", session_id)
    # Create an access token for the user
    access_token = create_access_token({"user_id": user_id})
    print("access token-->", access_token)

    # Create a refresh token for the user
    refresh_token = create_access_token({"session_id": session_id})
    print("refresh token--->", refresh_token)

    base_config = {"httponly": True, "secure": True, "samesite": "none"}

    # create res object for returning to the client

    response = JSONResponse(content={"message": "User registered successfully","access_token": access_token}, status_code=201)
    
    # Set the cookies in the response
    response.set_cookie("access_token", access_token, max_age=3600, **base_config)
    response.set_cookie("refresh_token", refresh_token, max_age=7*24*3600, **base_config)

    # Return a response indicating successful registration
    return response

@router.post("/login")
async def login_user(request: Request, user: LoginModel):
    # Extract the user data from the request body
    user_data = user.dict()
    # print("user data", user_data)

    # checking if the user exist
    user_exist = await db.user_collection.find_one({"email": user_data["email"]})
    print(" checking if the user exist", user_exist)
    if not user_exist:
        raise HTTPException(status_code=401, detail="user not found")
    
    user_id = str(user_exist["_id"])
    # print("user id", user_id)
    # Check if the password is correct
    if not verify_password(user_data["password"], user_exist["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create a new session
    session = SessionModel(
        user=user_id,
        user_agent=request.headers.get("User-Agent"),
        ip=request.client.host
    )
    # Save the session to the database 
    session_result = await db.session_collection.insert_one(session.dict())

    session_id = str(session_result.inserted_id)

    # Create a refresh token for the user
    refresh_token = create_access_token({"session_id": session_id})
    # print("refresh token--->", refresh_token)
    access_token = create_access_token({"user_id": user_id})
    # print("access token--->", access_token)


    base_config = {"httponly": True, "secure": True, "samesite": "none"}

    # Set the cookies in the response
    response = JSONResponse(content={"message": "User logged in successfully","access_token": access_token}, status_code=200)
    response.set_cookie("access_token", access_token, max_age=3600, **base_config)
    response.set_cookie("refresh_token", refresh_token, max_age=7*24*3600, **base_config)
    print("response", response)
    return response
    

@router.get("/me")
async def get_me(user: dict = Depends(verify_auth)):
    print("inside get me")
    """
    Returns the current logged-in user.
    verify_auth dependency already handles access/refresh token verification.

    """
     # Print current timestamp when the endpoint is called
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[GET /me] Called at {now}")
    # print("user", user)
    # Check 
    if not user:
        # This should normally never happen because verify_auth raises 401 for invalid tokens
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Optionally, you can remove sensitive fields before returning
      # Convert ObjectId to string
    user_data = {k: v for k, v in user.items() if k != "password"}
    if "_id" in user_data and isinstance(user_data["_id"], ObjectId):
        user_data["_id"] = str(user_data["_id"])

    # print("user data inside get me", user_data)
    print()
    return user_data
