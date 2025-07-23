from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional

from ai_coach import EnhancedAICoach
from neuro_summarizer import NeuroSummarizer
from file_processor import FileProcessor

app = FastAPI()

# ========== Health check ==========
@app.get("/")
def health():
    return {"status": "✅ FastAPI backend is alive!"}


# ========== AI Coach Routes ==========
class UserMessage(BaseModel):
    user_id: str
    message: str
    current_topic: Optional[str] = ""

@app.post("/chat")
def chat(user_input: UserMessage):
    coach = EnhancedAICoach(user_input.user_id)
    response = coach.generate_personalized_response(user_input.message, user_input.current_topic)
    return {"response": response}

@app.get("/suggestions/{user_id}")
def get_suggestions(user_id: str):
    coach = EnhancedAICoach(user_id)
    return {"suggestions": coach.get_personalized_suggestions()}

@app.get("/insights/{user_id}")
def get_insights(user_id: str):
    coach = EnhancedAICoach(user_id)
    return coach.get_learning_insights()

@app.get("/motivation/{user_id}")
def get_motivation(user_id: str):
    coach = EnhancedAICoach(user_id)
    return {"message": coach.generate_motivational_message()}


# ========== Summarizer Routes ==========
class SummaryInput(BaseModel):
    content: str

@app.post("/summarize/basic")
def summarize_basic(input: SummaryInput):
    summarizer = NeuroSummarizer()
    summary = summarizer.basic_summary(input.content)
    return {"summary": summary}

@app.post("/summarize/story")
def summarize_story(input: SummaryInput):
    summarizer = NeuroSummarizer()
    story = summarizer.story_mode_summary(input.content)
    return {"story": story}

@app.post("/summarize/visual")
def summarize_visual(input: SummaryInput):
    summarizer = NeuroSummarizer()
    visual = summarizer.visual_mode_summary(input.content)
    return {"visual_summary": visual}

@app.post("/summarize/all")
def summarize_all(input: SummaryInput):
    summarizer = NeuroSummarizer()
    all_summaries = summarizer.get_all_summaries(input.content)
    return all_summaries


# ========== File Processor Routes ==========
@app.post("/upload/pdf")
async def extract_pdf_text(file: UploadFile = File(...)):
    processor = FileProcessor()
    text = processor.extract_pdf_text(file)
    return {"extracted_text": text}

@app.post("/youtube/transcript")
def youtube_transcript(url: str = Form(...)):
    processor = FileProcessor()
    title, transcript = processor.extract_youtube_transcript(url)
    return {"title": title, "transcript": transcript}

@app.post("/save/content")
def save_content(
    content: str = Form(...),
    filename: str = Form(...),
    content_type: str = Form(...)
):
    processor = FileProcessor()
    path = processor.save_content(content, filename, content_type)
    return {"saved_to": path}
