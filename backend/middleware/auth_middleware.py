from fastapi import Request, HTTPException, Depends, Response
from jwt import PyJWTError
from datetime import datetime
from jwt_utils.auth import decode_token, create_access_token
import config_fold.db as db
from bson import ObjectId

# Token expiry in seconds
ACCESS_TOKEN_EXPIRY = 3600  # 1 hour
REFRESH_TOKEN_EXPIRY = 7 * 24 * 3600  # 7 days

async def verify_auth(request: Request, response: Response):
    """
    FastAPI dependency to get the current authenticated user.
    Mimics Express `return next()` by returning immediately on success.
    """
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")
    # print("access token and refresh token", access_token, refresh_token)

    if not access_token and not refresh_token:
        raise HTTPException(status_code=401, detail="Unauthorized. Please login.")

    # --- Try access token first ---
    if access_token:
        print("inside access token")
        try:
            decoded = decode_token(access_token)
            print("decoded n verify auth if aces token ", decoded)
            user = await db.user_collection.find_one({"_id": ObjectId(decoded["user_id"])})
            print("user checking in verify auth", user)
            if user:
                return user  # ✅ Early return, like `return next()` in Express
        except PyJWTError:
            pass  # fall through to refresh token

    # --- Try refresh token ---
    if refresh_token:
        try:
            decoded = decode_token(refresh_token)
            session = await db.session_collection.find_one({"_id": ObjectId(decoded["user_id"]), "valid": True})

            if session:
                user = await db.user_collection.find_one({"_id": session["user"]})
                if user:
                    # Invalidate old session
                    await db.session_collection.update_one({"_id": session["_id"]}, {"$set": {"valid": False}})

                    # Create new session
                    new_session = {
                        "user": user["_id"],
                        "user_agent": request.headers.get("user-agent"),
                        "ip": request.client.host,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "valid": True
                    }
                    new_session_result = await db.session_collection.insert_one(new_session)

                    # Create new tokens
                    new_access_token = create_access_token({"user_id": str(user["_id"])})
                    new_refresh_token = create_access_token(
                        {"session_id": str(new_session_result.inserted_id)},
                        expires_minutes=7*24*60
                    )

                    # Set cookies
                    base_config = {"httponly": True, "secure": True, "samesite": "none"}
                    response.set_cookie("access_token", new_access_token, max_age=ACCESS_TOKEN_EXPIRY, **base_config)
                    response.set_cookie("refresh_token", new_refresh_token, max_age=REFRESH_TOKEN_EXPIRY, **base_config)

                    return user  # ✅ Early return after refresh, like `return next()`
        except PyJWTError:
            raise HTTPException(status_code=401, detail="Session expired. Please login again.")

    # --- No valid user ---
    raise HTTPException(status_code=401, detail="Unauthorized. Please login.")


async def soft_verify_auth(request: Request, response: Response):
    """
    Soft FastAPI dependency:
    - Tries to get the current user from access token.
    - Falls back to refresh token with session rotation.
    - Returns None if no valid user instead of raising exception.
    """
    user = None

    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")

    # --- Try access token first ---
    if access_token:
        try:
            decoded = decode_token(access_token)
            user = await db.user_collection.find_one({"_id": decoded["user_id"]})
            if user:
                return user  # Early return on success
        except PyJWTError:
            pass  # fail silently, try refresh token

    # --- Try refresh token ---
    if refresh_token:
        try:
            decoded = decode_token(refresh_token)
            session = await db.session_collection.find_one({"_id": decoded["session_id"], "valid": True})
            if session:
                user = await db.user_collection.find_one({"_id": session["user"]})
                if user:
                    # Rotate session
                    await db.session_collection.update_one({"_id": session["_id"]}, {"$set": {"valid": False}})

                    new_session = {
                        "user": user["_id"],
                        "user_agent": request.headers.get("user-agent"),
                        "ip": request.client.host,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "valid": True
                    }
                    new_session_result = await db.session_collection.insert_one(new_session)

                    # Create new tokens and set cookies
                    new_access_token = create_access_token({"user_id": str(user["_id"])})
                    new_refresh_token = create_access_token(
                        {"session_id": str(new_session_result.inserted_id)},
                        expires_minutes=7*24*60
                    )

                    base_config = {"httponly": True, "secure": True, "samesite": "none"}
                    response.set_cookie("access_token", new_access_token, max_age=ACCESS_TOKEN_EXPIRY, **base_config)
                    response.set_cookie("refresh_token", new_refresh_token, max_age=REFRESH_TOKEN_EXPIRY, **base_config)

                    return user
        except PyJWTError:
            pass  # fail silently

    # --- No valid user, return None instead of raising ---
    return None