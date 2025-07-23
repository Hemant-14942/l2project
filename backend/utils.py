import jwt
import time
from config import LIVEKIT_API_KEY, LIVEKIT_API_SECRET

def generate_livekit_token(user_id: str, room_name: str = "default-room") -> str:
    now = int(time.time())
    exp = now + 60 * 60  # 1 hour expiration

    payload = {
        "iss": LIVEKIT_API_KEY,
        "sub": user_id,
        "nbf": now,
        "exp": exp,
        "video": {
            "roomJoin": True,
            "room": room_name,
            "canPublish": True,
            "canSubscribe": True
        }
    }

    token = jwt.encode(payload, LIVEKIT_API_SECRET, algorithm="HS256")
    return token
