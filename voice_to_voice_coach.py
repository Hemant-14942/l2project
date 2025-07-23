
import asyncio
import json
import os
import base64
import tempfile
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import whisper
import io
import streamlit as st
from livekit import rtc
from config import LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, AZURE_OPENAI_API_KEY, ENDPOINT_URL, DEPLOYMENT_NAME
import openai
import numpy as np
from gtts import gTTS
import pygame
import threading


class VoiceToVoiceCoach:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.conversation_file = f"user_data/{user_id}_voice_conversations.json"
        self.session_active = False
        self.whisper_model = None
        self.openai_client = None
        self.setup_ai_clients()

    def setup_ai_clients(self):
        """Setup AI clients for voice processing"""
        try:
            # Initialize Whisper for speech recognition
            self.whisper_model = whisper.load_model("base")

            # Initialize OpenAI client for responses
            if AZURE_OPENAI_API_KEY and ENDPOINT_URL:
                self.openai_client = openai.AzureOpenAI(
                    api_key=AZURE_OPENAI_API_KEY,
                    api_version="2024-02-01",
                    azure_endpoint=ENDPOINT_URL
                )

        except Exception as e:
            print(f"Error setting up AI clients: {e}")

    def start_voice_session(self) -> Dict:
        """Start a new voice session"""
        try:
            self.session_active = True
            session_id = f"voice_session_{int(time.time())}"

            # Initialize session data
            session_data = {
                "session_id": session_id,
                "start_time": datetime.now().isoformat(),
                "active": True,
                "conversation_history": []
            }

            # Store in session state
            st.session_state.voice_session = session_data

            return {
                "status": "success",
                "message": "Voice session started successfully",
                "session_id": session_id
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to start voice session: {str(e)}"
            }

    def stop_voice_session(self) -> Dict:
        """Stop the current voice session"""
        try:
            self.session_active = False

            # Save conversation history
            if hasattr(st.session_state, 'voice_session'):
                session_data = st.session_state.voice_session
                session_data["end_time"] = datetime.now().isoformat()
                session_data["active"] = False
                self._save_conversation_history(session_data)

                # Clear session state
                if 'voice_session' in st.session_state:
                    del st.session_state.voice_session

            return {
                "status": "success",
                "message": "Voice session ended successfully"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to stop voice session: {str(e)}"
            }

    def get_session_status(self) -> Dict:
        """Get current voice session status, including message count"""
        if hasattr(st.session_state, 'voice_session') and st.session_state.voice_session:
            conversation_history = st.session_state.voice_session.get("conversation_history", [])
            return {
                "active": st.session_state.voice_session.get("active", False),
                "session_id": st.session_state.voice_session.get("session_id", ""),
                "start_time": st.session_state.voice_session.get("start_time", ""),
                "last_activity": conversation_history[-1]["timestamp"] if conversation_history else None,
                "message_count": len(conversation_history)
            }
        return {
            "active": False,
            "session_id": "",
            "start_time": "",
            "last_activity": None,
            "message_count": 0
        }

    def process_audio_input(self, audio_data: bytes) -> Dict:
        """Process audio input and generate AI response"""
        try:
            # Convert audio to text using Whisper
            if isinstance(audio_data, str):
                # If it's base64 encoded
                audio_bytes = base64.b64decode(audio_data)
            else:
                audio_bytes = audio_data

            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                temp_audio.write(audio_bytes)
                temp_audio_path = temp_audio.name

            # Transcribe audio
            if self.whisper_model:
                result = self.whisper_model.transcribe(temp_audio_path)
                user_text = result["text"].strip()
            else:
                user_text = "Audio transcription not available"

            # Clean up temp file
            os.unlink(temp_audio_path)

            if not user_text:
                return {
                    "status": "error",
                    "message": "No speech detected in audio"
                }

            # Generate AI response
            ai_response = self._generate_ai_response(user_text)

            # Create audio response
            audio_response = self._create_audio_response(ai_response)

            # Store conversation
            self._store_conversation_exchange(user_text, ai_response)

            return {
                "status": "success",
                "user_text": user_text,
                "ai_response": ai_response,
                "audio_response": audio_response
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing audio: {str(e)}"
            }

    def _generate_ai_response(self, user_text: str) -> str:
        """Generate AI response using OpenAI"""
        try:
            if not self.openai_client:
                return "I'm sorry, I'm having trouble connecting to my AI brain right now. Please try again later."

            # Build conversation context
            system_prompt = """You are a friendly, encouraging AI learning coach. Your role is to:

            1. Help students understand concepts through clear explanations
            2. Provide step-by-step guidance for complex topics
            3. Encourage and motivate learners
            4. Adapt explanations to different learning styles
            5. Ask follow-up questions to ensure understanding
            6. Use analogies and examples to make concepts clear
            7. Be patient and supportive, especially when students struggle

            Keep responses conversational and engaging. Speak as if you're having a friendly chat with a student who wants to learn."""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ]

            # Add recent conversation history for context
            conversation_history = self.get_conversation_history(3)
            for exchange in conversation_history:
                messages.extend([
                    {"role": "user", "content": exchange["user_text"]},
                    {"role": "assistant", "content": exchange["ai_response"]}
                ])

            # Add current user message
            messages.append({"role": "user", "content": user_text})

            response = self.openai_client.chat.completions.create(
                model=DEPLOYMENT_NAME,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            return f"I'm having trouble processing your question right now. Could you please try again? (Error: {str(e)})"

    def _create_audio_response(self, text: str) -> Optional[str]:
        """Create audio response from text"""
        try:
            # Use gTTS for text-to-speech
            tts = gTTS(text=text, lang='en', slow=False)

            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_audio:
                tts.save(temp_audio.name)

                # Convert to base64 for streaming
                with open(temp_audio.name, 'rb') as audio_file:
                    audio_data = audio_file.read()
                    audio_base64 = base64.b64encode(audio_data).decode()

                # Clean up
                os.unlink(temp_audio.name)

                return audio_base64

        except Exception as e:
            print(f"Error creating audio response: {e}")
            return None

    def _store_conversation_exchange(self, user_text: str, ai_response: str):
        """Store conversation exchange"""
        if hasattr(st.session_state, 'voice_session') and st.session_state.voice_session:
            exchange = {
                "timestamp": datetime.now().isoformat(),
                "user_text": user_text,
                "ai_response": ai_response
            }

            st.session_state.voice_session["conversation_history"].append(exchange)

    def _save_conversation_history(self, session_data: Dict):
        """Save conversation history to file"""
        try:
            conversations = []
            if os.path.exists(self.conversation_file):
                with open(self.conversation_file, 'r') as f:
                    conversations = json.load(f)

            conversations.append(session_data)

            # Keep only last 50 conversations
            conversations = conversations[-50:]

            with open(self.conversation_file, 'w') as f:
                json.dump(conversations, f, indent=2)

        except Exception as e:
            print(f"Error saving conversation history: {e}")

    def get_conversation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        if hasattr(st.session_state, 'voice_session') and st.session_state.voice_session:
            history = st.session_state.voice_session.get("conversation_history", [])
            return history[-limit:] if history else []
        return []

    def process_text_input(self, text: str) -> Dict:
        """Process text input (for testing without voice)"""
        try:
            ai_response = self._generate_ai_response(text)
            self._store_conversation_exchange(text, ai_response)

            return {
                "status": "success",
                "user_text": text,
                "ai_response": ai_response
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing text: {str(e)}"
            }


class LiveKitVoiceCoach:
    """Advanced LiveKit-based voice coach (for future implementation)"""

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.room = None
        self.connected = False

    async def connect_to_room(self, room_name: str) -> Dict:
        """Connect to LiveKit room"""
        try:
            if not all([LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL]):
                return {
                    "status": "error",
                    "message": "LiveKit credentials not configured"
                }

            # This would implement actual LiveKit connection
            # For now, return success to indicate it's ready for implementation
            return {
                "status": "success",
                "message": "LiveKit voice coach ready for implementation"
            }

        except Exception as e:
            return {
                "status": "error",
                "message": f"LiveKit connection error: {str(e)}"
            }

    async def start_voice_session(self) -> Dict:
        """Start LiveKit voice session"""
        # Future implementation for real-time voice
        return {
            "status": "info",
            "message": "LiveKit real-time voice coming soon!"
        }
