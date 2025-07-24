import os
import tempfile
import fitz  # PyMuPDF
import PyPDF2
import yt_dlp
import requests
from typing import Optional, Tuple
import streamlit as st
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes


# Set tesseract path manually (adjust if installed elsewhere)
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

class FileProcessor:
    def __init__(self):
        # Set API key for ElevenLabs
        os.environ["ELEVENLABS_API_KEY"] = "sk_38b2b4eb5f4c1e4b72703f499de6b0eaa475c72beb02e034"
        self.elevenlabs_api_key = os.environ["ELEVENLABS_API_KEY"]



    def extract_pdf_text(self, pdf_file) -> str:
        try:
            pdf_bytes = pdf_file.read()
            pdf_file.seek(0)

            # First try with PyMuPDF
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()

            if text.strip():
                return text

            # Second try with PyPDF2
            pdf_file.seek(0)
            reader = PyPDF2.PdfReader(pdf_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted

            if text.strip():
                return text

            # 🔁 Fallback: OCR using pdf2image + pytesseract
            st.info(" Using OCR to extract text from scanned PDF...")
            images = convert_from_bytes(pdf_bytes)
            for img in images:
                text += pytesseract.image_to_string(img)

            return text.strip()

        except Exception as e:
            st.error(f"Error extracting PDF text: {str(e)}")
            return ""

    def extract_youtube_transcript(self, url: str) -> Tuple[str, str]:
        try:
            # Download using yt-dlp
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': 'temp_audio.%(ext)s',
                'quiet': True,
                'no_warnings': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }

            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    title = info.get('title', 'Unknown Video')
            except yt_dlp.utils.DownloadError as e:
                if '403' in str(e):
                    st.error("🚫 Access denied: This video may be restricted or blocked. Try another link.")
                else:
                    st.error(f"❌ Download error: {str(e)}")
                return "Error", ""

            # Find the downloaded MP3
            audio_file = next((f for f in os.listdir('.') if f.startswith('temp_audio') and f.endswith('.mp3')), None)

            if not audio_file or not os.path.exists(audio_file):
                return title, "Audio file not found or failed to download."

            # Transcribe using ElevenLabs API
            transcript = self.transcribe_with_elevenlabs(audio_file)

            # Cleanup
            os.remove(audio_file)

            return title, transcript

        except Exception as e:
            st.error(f"Error processing YouTube video: {str(e)}")
            return "Error", ""

    def transcribe_with_elevenlabs(self, audio_path: str) -> str:
        try:
            with open(audio_path, "rb") as f:
                audio_data = f.read()

            files = {
                'file': (os.path.basename(audio_path), audio_data, 'audio/mpeg')
            }

            data = {
                "model_id": "scribe_v1"  # ✅ use valid model_id
            }

            response = requests.post(
                "https://api.elevenlabs.io/v1/speech-to-text",
                headers={"xi-api-key": self.elevenlabs_api_key},
                files=files,
                data=data
            )

            if response.status_code == 200:
                return response.json().get("text", "(No text found)")
            else:
                st.error(f"Transcription failed: {response.text}")
                return ""

        except Exception as e:
            st.error(f"Error transcribing audio: {str(e)}")
            return ""

    def save_content(self, content: str, filename: str, content_type: str) -> str:
        try:
            filepath = os.path.join("uploads", f"{filename}_{content_type}.txt")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return filepath
        except Exception as e:
            st.error(f"Error saving content: {str(e)}")
            return ""
