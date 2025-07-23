import pyttsx3
import os
import tempfile
import base64
from typing import Dict, Optional
from gtts import gTTS
import soundfile as sf
import numpy as np


class NeuroTTSEngine:
    def __init__(self):
        self.tts_engine = None
        self.setup_engine()

    def setup_engine(self):
        """Initialize TTS engine"""
        try:
            self.tts_engine = pyttsx3.init()
            # Set voice properties for neuro-friendly speech
            self.tts_engine.setProperty('rate', 120)  # Slower speech
            self.tts_engine.setProperty('volume', 0.8)

            # Try to set a pleasant voice
            voices = self.tts_engine.getProperty('voices')
            if voices:
                for voice in voices:
                    if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                        self.tts_engine.setProperty('voice', voice.id)
                        break
        except Exception as e:
            print(f"TTS Engine setup error: {e}")
            self.tts_engine = None

    def create_summary_audio(self, summaries: Dict, summary_type: str) -> Optional[str]:
        """Create audio for summary content"""
        if summary_type not in summaries:
            return None

        text = summaries[summary_type]
        return self.text_to_speech(text, f"summary_{summary_type}")

    def text_to_speech(self, text: str, filename: str = "output") -> Optional[str]:
        """Convert text to speech and return audio file path"""
        try:
            # Create audio directory if it doesn't exist
            os.makedirs("audio", exist_ok=True)

            # Use gTTS as fallback if pyttsx3 fails
            if self.tts_engine is None:
                return self._create_gtts_audio(text, filename)

            # Use pyttsx3 for local TTS
            audio_path = f"audio/{filename}.wav"
            self.tts_engine.save_to_file(text, audio_path)
            self.tts_engine.runAndWait()

            if os.path.exists(audio_path):
                return audio_path
            else:
                return self._create_gtts_audio(text, filename)

        except Exception as e:
            print(f"TTS Error: {e}")
            return self._create_gtts_audio(text, filename)

    def _create_gtts_audio(self, text: str, filename: str) -> Optional[str]:
        """Create audio using Google TTS as fallback"""
        try:
            tts = gTTS(text=text, lang='en', slow=True)  # Slower for neuro-friendly
            audio_path = f"audio/{filename}.mp3"
            tts.save(audio_path)
            return audio_path
        except Exception as e:
            print(f"gTTS Error: {e}")
            return None

    def create_focus_session_audio(self, content: str, session_type: str) -> Optional[str]:
        """Create audio for focus sessions"""
        focus_intro = f"Starting your {session_type} focus session. Take a deep breath and concentrate on the content."
        full_text = f"{focus_intro} {content}"
        return self.text_to_speech(full_text, f"focus_{session_type}")

    def create_motivational_audio(self, message: str) -> Optional[str]:
        """Create motivational audio messages"""
        return self.text_to_speech(message, "motivation")