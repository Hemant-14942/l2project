import os
import tempfile
import fitz  # PyMuPDF
import PyPDF2
from dotenv import load_dotenv
import yt_dlp
import requests
from typing import Tuple
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes


# Load environment variables
load_dotenv()

# Set tesseract path manually (adjust if installed elsewhere)
pytesseract.pytesseract.tesseract_cmd = r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"


class FileProcessor:
    def __init__(self):
        elevenlabs_api_key ="sk_69d1a46194b03f856a41e8759001a7b848cbfed35ca92b46"
        if not self.elevenlabs_api_key:
            raise ValueError("ELEVENLABS_API_KEY not found in environment")

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
            print("Using OCR to extract text from scanned PDF...")
            images = convert_from_bytes(pdf_bytes)
            for img in images:
                text += pytesseract.image_to_string(img)

            return text.strip()

        except Exception as e:
            print(f"Error extracting PDF text: {str(e)}")
            return ""

    def extract_youtube_transcript(self, url: str) -> Tuple[str, str]:
        try:
            print("Downloading audio...")
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': 'temp_audio.%(ext)s',
                'quiet': True,
                'no_warnings': True,
                'user_agent': (
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
                ),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            }

            try:
                print("inside try block of extract_youtube_transcript function")
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    title = info.get('title', 'Unknown Video')
            except yt_dlp.utils.DownloadError as e:
                print(f"Download error: {str(e)}")
                return "Error", ""

            # Locate the downloaded audio
            audio_file = next((f for f in os.listdir('.') if f.startswith('temp_audio') and f.endswith('.mp3')), None)
            print(f"Audio file: {audio_file}")
            if not audio_file or not os.path.exists(audio_file):
                return title, "Audio file not found or failed to download."
            
            print("Transcribing audio...")
            transcript = self.transcribe_with_elevenlabs(audio_file)
            print(f"Transcript: {transcript}")

            # Cleanup
            os.remove(audio_file)

            return title, transcript

        except Exception as e:
            print(f"Error processing YouTube video: {str(e)}")
            return "Error", ""

    def extract_uploaded_audio_transcript(self, audio_file_path: str) -> Tuple[str, dict]:
        try:
            print("inside extract_uploaded_audio_transcript function")
            print(f"Transcribing audio: {audio_file_path}")
            if not os.path.exists(audio_file_path):
                return "Error", {
                    "basic": "File not found.",
                    "story": "File not found.",
                    "visual": "File not found.",
                }

            transcript = self.transcribe_with_elevenlabs(audio_file_path)
            return transcript

        except Exception as e:
            return "Error", {
                "basic": f"Error: {str(e)}",
                "story": f"Error: {str(e)}",
                "visual": f"Error: {str(e)}",
            }

    def transcribe_with_elevenlabs(self, audio_path: str) -> str:
        try:
            with open(audio_path, "rb") as f:
                audio_data = f.read()

            files = {
                'file': (os.path.basename(audio_path), audio_data, 'audio/mpeg')
            }

            data = {"model_id": "scribe_v1"}

            response = requests.post(
                "https://api.elevenlabs.io/v1/speech-to-text",
                headers={"xi-api-key": self.elevenlabs_api_key},
                files=files,
                data=data
            )

            print("Response status:", response.status_code)
            print("Response text:", response.text)

            if response.status_code == 200:
                return response.json().get("text", "(No text found)")
            else:
                return f"Transcription failed: {response.text}"

        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
            return ""

    def save_content(self, content: str, filename: str, content_type: str) -> str:
        try:
            os.makedirs("uploads", exist_ok=True)
            filepath = os.path.join("uploads", f"{filename}_{content_type}.txt")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return filepath
        except Exception as e:
            print(f"Error saving content: {str(e)}")
            return ""
