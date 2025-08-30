"""
Unified FastAPI Backend Server for EduVoice.AI Learning Platform
Combines all AI coaching, summarization, file processing, and voice features
"""

import os
import json
import base64
import tempfile
from datetime import datetime
from typing import Optional, Dict, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket,Request,Cookie,Depends,Response,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse,RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from urllib.parse import urlencode
from pathlib import Path
import shutil
import requests

from jwt_utils.auth import create_access_token, decode_token
from flashcard_generator import  FlashcardGenerator
from config.db import connect_db, close_db

# Import our custom modules
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()



# Load environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN")

try:
    from ai_coach import EnhancedAICoach
    from neuro_summarizer import NeuroSummarizer
    from file_processor import FileProcessor
    # Optional imports - will create dummy classes if not available
    try:
        from tts_engine import NeuroTTSEngine
    except ImportError:
        class NeuroTTSEngine:
            def create_summary_audio(self, summaries, mode): return None
            def create_audio_file(self, text): return None

    try:
        from flashcard_generator import FlashcardGenerator
    except ImportError:
        class FlashcardGenerator:
            def generate_flashcards(self, content, difficulty): return []
            def save_flashcard_performance(self, user_id, card, correct, response_time): return None

    try:
        from focus_tracker import FocusTracker
    except ImportError:
        class FocusTracker:
            def __init__(self, user_id): pass
            def get_focus_analytics(self, days): return {"total_sessions": 0, "avg_focus_time": 0, "completion_rate": 0, "avg_response_time": 0, "accuracy": 0, "break_frequency": {}}

    try:
        from quiz_system import EnhancedGamifiedQuizSystem
    except ImportError:
        class EnhancedGamifiedQuizSystem:
            def __init__(self, user_id): pass
            def generate_quiz_questions(self, content, difficulty): return []
            def create_quiz_session(self, questions, title): return "dummy_session"
            def submit_answer(self, session_id, answer, response_time): return {"correct": False, "explanation": "N/A"}
            def get_quiz_session(self, session_id): return None
            def get_streak_info(self): return {"current_streak": 0, "best_streak": 0, "total_quizzes": 0}
            def get_performance_analytics(self): return {"total_quizzes": 0, "avg_accuracy": 0, "avg_response_time": 0, "improvement_trend": "N/A"}

    try:
        from visual_feedback_manager import VisualFeedbackManager
    except ImportError:
        class VisualFeedbackManager:
            def __init__(self, user_id): pass
            def get_user_achievements(self): return {"total_badges": 0, "total_points": 0, "recent_badges": []}

    try:
        from session_manager import SessionManager
    except ImportError:
        class SessionManager:
            def __init__(self, user_id): pass
            def mood_checkin(self, mood): return None
            def get_learning_analytics(self): return {"total_sessions": 0, "avg_understanding": 0, "total_time": 0}
            def get_mood_history(self, days): return []

    try:
        from voice_to_voice_coach import VoiceToVoiceCoach
        from api_voice_coach import FastAPIVoiceCoach, voice_coach
    except ImportError:
        class VoiceToVoiceCoach:
            def __init__(self, user_id): pass

        class FastAPIVoiceCoach:
            def create_voice_session(self, user_id): return {"status": "error", "message": "Voice coach not available"}
            def stop_voice_session(self, session_id): return {"status": "error", "message": "Voice coach not available"}
            def get_session_status(self, session_id): return {"status": "error", "message": "Voice coach not available"}
            def process_audio_input(self, session_id, audio_data): return {"status": "error", "message": "Voice coach not available"}
            def process_text_input(self, session_id, text): return {"status": "error", "message": "Voice coach not available"}
            def get_conversation_history(self, session_id, limit): return []

        voice_coach = FastAPIVoiceCoach()

except ImportError as e:
    print(f"Warning: Some modules not available: {e}")
    # Create minimal dummy classes for missing modules
    class DummyClass:
        def __init__(self, *args, **kwargs): pass
        def __getattr__(self, name): return lambda *args, **kwargs: None

    EnhancedAICoach = DummyClass
    NeuroSummarizer = DummyClass
    FileProcessor = DummyClass

# FastAPI App
app = FastAPI(
    title="EduVoice.AI - Unified Learning Platform API",
    description="Complete neuro-friendly learning platform with AI coaching, voice interaction, and adaptive learning",
    version="1.0.0"
)


# ========== CORS Setup ==========
origins = [
    "http://localhost:5173",  # React frontend
    "http://127.0.0.1:5173"   # Alternative localhost access
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Static files
os.makedirs("audio_cache", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "audio"
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize components
file_processor = FileProcessor()
summarizer = NeuroSummarizer()

# Initialize optional components with fallbacks
try:
    tts_engine = NeuroTTSEngine()
    print("✅ TTS Engine: Initialized successfully")
except:
    class DummyTTSEngine:
        def create_summary_audio(self, summaries, mode): return None
        def create_audio_file(self, text): return None
    tts_engine = DummyTTSEngine()

try:
    flashcard_gen = FlashcardGenerator()
except:
    class DummyFlashcardGen:
        def generate_flashcards(self, content, difficulty): return []
        def save_flashcard_performance(self, user_id, card, correct, response_time): return None
    flashcard_gen = DummyFlashcardGen()

# User-specific components (initialized per request)
def get_user_components(user_id: str):
    return {
        'ai_coach': EnhancedAICoach(user_id),
        'focus_tracker': FocusTracker(user_id),
        'quiz_system': EnhancedGamifiedQuizSystem(user_id),
        'visual_feedback': VisualFeedbackManager(user_id),
        'session_manager': SessionManager(user_id),
        'voice_coach': VoiceToVoiceCoach(user_id)
    }
def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    print(f"access_token: {access_token}")

    
    user = decode_token(access_token)
    if not user:
        raise HTTPException(status_code=403, detail="Invalid token")
    
    return user

@app.get("/protected")
def protected_route(user: dict = Depends(get_current_user)):
    return {
        "message": f"Hello {user['name']}, you're authenticated!",
        "user": user  # ✅ Include this!
    }
@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


# Pydantic models
class UserMessage(BaseModel):
    user_id: str
    message: str
    current_topic: Optional[str] = ""

class SummaryInput(BaseModel):
    content: str
    user_id: Optional[str] = "demo_user"

class FlashcardRequest(BaseModel):
    content: str
    difficulty: str
    user_id: str

class QuizRequest(BaseModel):
    content: str
    difficulty: str
    user_id: str

class QuizAnswer(BaseModel):
    session_id: str
    user_id: str
    selected_answer: int
    response_time: float

class VoiceSessionRequest(BaseModel):
    user_id: str

class AudioProcessRequest(BaseModel):
    session_id: str
    user_id: str
    audio_data: str

class TextInputRequest(BaseModel):
    session_id: str
    user_id: str
    text: str

# ============= HEALTH CHECK =============
@app.get("/api")
@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "✅ EduVoice.AI Unified Backend is running!",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "features": {
            "ai_coach": True,
            "summarization": True,
            "file_processing": True,
            "voice_coaching": True,
            "flashcards": True,
            "quizzes": True,
            "analytics": True
        }
    }

# ------------------google auth routes --------------------------
# Step 1: Redirect user to Google login
@app.get("/auth/google")
def login_via_google():
    print("inside login_via_google")
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": REDIRECT_URI,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    # print("redirecting to google---->", url)
    
    return RedirectResponse(url)

# Step 2: Google redirects here with ?code=
@app.get("/auth/google/callback")
def google_callback(request: Request, response: Response):
    print("inside google_callback")
    code = request.query_params.get("code")
    # print("code", code)
    if not code:
        raise HTTPException(status_code=400, detail="No code provided")

    # Exchange code for token
    token_res = requests.post("https://oauth2.googleapis.com/token", data={
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code"
    })
    # print("token_res", token_res)

    tokens = token_res.json()
    access_token = tokens.get("access_token")
    print("userinfo k liye google ki api clla krne ja rah hu")
    # Get user info
    userinfo = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
        "Authorization": f"Bearer {access_token}"
    }).json()
    print("userinfo", userinfo)
    jwt_token = create_access_token({
        "email": userinfo["email"],
        "name": userinfo["name"]
    })

    # Set cookie (secure, HttpOnly)
    response = RedirectResponse(url="http://localhost:5173/")  # or wherever
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,  # ❌ should be False only if using HTTP
        samesite="Lax",  # Lax is okay if redirecting
        max_age=3600
    )

    print("response", response)
    return response
    
# ============= AI COACH ENDPOINTS =============
@app.post("/api/chat")
def chat_with_coach(user_input: UserMessage):
    """Chat with AI learning coach"""
    try:
        components = get_user_components(user_input.user_id)
        coach = components['ai_coach']
        response = coach.generate_personalized_response(user_input.message, user_input.current_topic)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suggestions/{user_id}")
def get_suggestions(user_id: str):
    """Get personalized learning suggestions"""
    try:
        components = get_user_components(user_id)
        coach = components['ai_coach']
        suggestions = coach.get_personalized_suggestions()
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insights/{user_id}")
def get_insights(user_id: str):
    """Get learning insights and analytics"""
    try:
        components = get_user_components(user_id)
        coach = components['ai_coach']
        insights = coach.get_learning_insights()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/motivation/{user_id}")
def get_motivation(user_id: str):
    """Get motivational message"""
    try:
        components = get_user_components(user_id)
        coach = components['ai_coach']
        message = coach.generate_motivational_message()
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= SUMMARIZATION ENDPOINTS =============
@app.post("/api/summarize/basic")
def summarize_basic(input: SummaryInput):
    """Generate basic summary"""
    try:
        summary = summarizer.basic_summary(input.content)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize/story")
def summarize_story(input: SummaryInput):
    """Generate story-mode summary"""
    try:
        story = summarizer.story_mode_summary(input.content)
        return {"story": story}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize/visual")
def summarize_visual(input: SummaryInput):
    """Generate visual summary"""
    try:
        visual = summarizer.visual_mode_summary(input.content)
        return {"visual_summary": visual}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize/all")
def summarize_all(input: SummaryInput):
    print("inside summarize_all")
    """Generate all summary types"""
    try:
        print("inside try")
        summaries = summarizer.get_all_summaries(input.content)
        return summaries
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= FILE PROCESSING ENDPOINTS =============
@app.post("/api/upload/pdf")
async def extract_pdf_text(file: UploadFile = File(...)):
    """Extract text from PDF"""
    try:
        text = file_processor.extract_pdf_text(file.file)
        return {"extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/youtube/transcript")
def youtube_transcript(url: str = Form(...)):
    print("inside youtube_transcript")
    """Extract transcript from YouTube video"""
    try:
        print(f"Extracting transcript from: {url}")
        title, transcript = file_processor.extract_youtube_transcript(url)
        return {"title": title, "transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload/audio")
async def upload_audio(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=415, detail="Unsupported media type")
    
    print(f"Received file: {file.filename}")
    print(f"Content type: {file.content_type}")

    print("inside upload_audio")
    with open(f"temp_{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    audio_path = f"temp_{file.filename}"
    print(f"Saving audio to: {audio_path}")
    print("calling extract_uploaded_audio_transcript")
    transcript = file_processor.extract_uploaded_audio_transcript(audio_path)

    os.remove(audio_path)  # optional cleanup
    # return {"message": "File received", "filename": file.filename}
    return {"transcript": transcript}

@app.post("/api/save/content")
def save_content(
    content: str = Form(...),
    filename: str = Form(...),
    content_type: str = Form(...),
    user_id: str = Form(...)
):
    """Save content and add to AI coach knowledge base"""
    try:
        path = file_processor.save_content(content, filename, content_type)

        # Add to AI coach knowledge base
        if user_id:
            components = get_user_components(user_id)
            coach = components['ai_coach']
            coach.add_to_knowledge_base(content[:1000], filename, content_type)

        return {"saved_to": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= FLASHCARD ENDPOINTS =============
# Create the instance once
flashcard_generator = FlashcardGenerator()
@app.post("/api/flashcards/generate")
def generate_flashcards(request: FlashcardRequest):
    """Generate flashcards from content"""
    try:
        flashcards = flashcard_generator.generate_flashcards(request.content, request.difficulty)
        return {"flashcards": flashcards}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/flashcards/performance")
def save_flashcard_performance(
    user_id: str = Form(...),
    question: str = Form(...),
    answer: str = Form(...),
    correct: bool = Form(...),
    response_time: float = Form(...)
):
    """Save flashcard performance"""
    try:
        card = {"question": question, "answer": answer}
        flashcard_gen.save_flashcard_performance(user_id, card, correct, response_time)
        return {"status": "performance saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= QUIZ ENDPOINTS =============
@app.post("/api/quiz/generate")
def generate_quiz(request: QuizRequest):
    """Generate quiz questions"""
    try:
        components = get_user_components(request.user_id)
        quiz_system = components['quiz_system']
        questions = quiz_system.generate_quiz_questions(request.content, request.difficulty)

        if questions:
            session_id = quiz_system.create_quiz_session(questions, "Generated Quiz")
            return {
                "session_id": session_id,
                "questions": questions,
                "total_questions": len(questions),
                "msg": "Quiz questions generated successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to generate quiz questions")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/answer")
def submit_quiz_answer(answer: QuizAnswer):
    """Submit quiz answer"""
    try:
        components = get_user_components(answer.user_id)
        quiz_system = components['quiz_system']
        result = quiz_system.submit_answer(
            answer.session_id,
            answer.selected_answer,
            answer.response_time
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quiz/session/{session_id}/{user_id}")
def get_quiz_session(session_id: str, user_id: str):
    """Get quiz session details"""
    try:
        components = get_user_components(user_id)
        quiz_system = components['quiz_system']
        session = quiz_system.get_quiz_session(session_id)
        return {"session": session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quiz/streak/{user_id}")
def get_streak_info(user_id: str):
    """Get user streak information"""
    try:
        components = get_user_components(user_id)
        quiz_system = components['quiz_system']
        streak_info = quiz_system.get_streak_info()
        return streak_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= VOICE COACHING ENDPOINTS =============
@app.post("/api/voice/session/start")
def start_voice_session(request: VoiceSessionRequest):
    """Start a new voice session"""
    try:
        result = voice_coach.create_voice_session(request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/session/stop/{session_id}")
def stop_voice_session(session_id: str):
    """Stop voice session"""
    try:
        result = voice_coach.stop_voice_session(session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/session/status/{session_id}")
def get_voice_session_status(session_id: str):
    """Get voice session status"""
    try:
        result = voice_coach.get_session_status(session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/process_audio")
def process_audio(request: AudioProcessRequest):
    """Process audio input"""
    try:
        result = voice_coach.process_audio_input(
            request.session_id,
            request.audio_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/process_text")
def process_text(request: TextInputRequest):
    """Process text input for voice session"""
    try:
        result = voice_coach.process_text_input(request.session_id, request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voice/history/{session_id}")
def get_voice_conversation_history(session_id: str, limit: int = 10):
    """Get voice conversation history"""
    try:
        history = voice_coach.get_conversation_history(session_id, limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= ANALYTICS ENDPOINTS =============
@app.get("/api/analytics/focus/{user_id}")
def get_focus_analytics(user_id: str, days: int = 7):
    """Get focus analytics"""
    try:
        components = get_user_components(user_id)
        focus_tracker = components['focus_tracker']
        analytics = focus_tracker.get_focus_analytics(days)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/learning/{user_id}")
def get_learning_analytics(user_id: str):
    """Get learning analytics"""
    try:
        components = get_user_components(user_id)
        session_manager = components['session_manager']
        analytics = session_manager.get_learning_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/performance/{user_id}")
def get_performance_analytics(user_id: str):
    """Get quiz performance analytics"""
    try:
        components = get_user_components(user_id)
        quiz_system = components['quiz_system']
        analytics = quiz_system.get_performance_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/achievements/{user_id}")
def get_user_achievements(user_id: str):
    """Get user achievements"""
    try:
        components = get_user_components(user_id)
        visual_feedback = components['visual_feedback']
        achievements = visual_feedback.get_user_achievements()
        return achievements
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= MOOD & SESSION MANAGEMENT =============
@app.post("/api/mood/checkin")
def mood_checkin(user_id: str = Form(...), mood: str = Form(...)):
    """Record mood check-in"""
    try:
        components = get_user_components(user_id)
        session_manager = components['session_manager']
        session_manager.mood_checkin(mood)
        return {"status": "mood recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mood/history/{user_id}")
def get_mood_history(user_id: str, days: int = 7):
    """Get mood history"""
    try:
        components = get_user_components(user_id)
        session_manager = components['session_manager']
        history = session_manager.get_mood_history(days)
        return {"mood_history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# ============= TTS ENDPOINTS =============
@app.post("/api/tts/create")
def create_audio(text: str = Form(...), voice_type: str = Form("summary")):
    print("inside create_audio")
    """Create audio from text"""
    try:
        if voice_type == "summary":
            print("inside create_summary_audio")
            audio_file = tts_engine.create_summary_audio({"basic": text}, "basic")
        else:
            audio_file = tts_engine.create_audio_file(text)
        
        if audio_file:
            # Convert local path (e.g., audio/xyz.wav) to public URL
            filename = os.path.basename(audio_file)
            print(f"Audio saved to {filename}")
            return {"audio_file": f"/audio/{filename}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to create audio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= WEBSOCKET FOR REAL-TIME COMMUNICATION =============
@app.websocket("/api/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket for real-time communication"""
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            message_type = message.get("type")

            if message_type == "chat":
                # AI Coach chat
                components = get_user_components(user_id)
                coach = components['ai_coach']
                response = coach.generate_personalized_response(
                    message.get("message", ""),
                    message.get("topic", "")
                )

                await websocket.send_text(json.dumps({
                    "type": "chat_response",
                    "response": response
                }))

            elif message_type == "voice_audio":
                # Voice processing
                session_id = message.get("session_id")
                audio_data = message.get("audio_data")

                result = voice_coach.process_audio_input(session_id, audio_data)

                await websocket.send_text(json.dumps({
                    "type": "voice_response",
                    "data": result
                }))

            elif message_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# ============= UTILITY ENDPOINTS =============
@app.get("/api/config")
def get_config():
    """Get API configuration"""
    return {
        "features": {
            "ai_coach": True,
            "voice_coaching": True,
            "summarization": True,
            "file_processing": True,
            "flashcards": True,
            "quizzes": True,
            "analytics": True,
            "tts": True,
            "websocket": True
        },
        "supported_file_types": ["pdf"],
        "supported_content_sources": ["youtube", "text", "voice"],
        "summary_modes": ["basic", "story", "visual"],
        "difficulty_levels": ["Easy", "Medium", "Hard"]
    }

@app.on_event("startup")
async def startup_event():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()


#     uvicorn.run(app, host="0.0.0.0", port=8001)
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("UVICORN_HOST", "127.0.0.1"),
        port=int(os.getenv("UVICORN_PORT", 8000)),
        reload=True
    )