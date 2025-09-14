import openai
import re
from typing import Dict, List
from config import AZURE_OPENAI_API_KEY, ENDPOINT_URL, DEPLOYMENT_NAME


class NeuroSummarizer:
    def __init__(self):
        self.client = openai.AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2025-01-01-preview",
            azure_endpoint=ENDPOINT_URL
        )
        self.model = DEPLOYMENT_NAME

    def _call_openai(self, system_prompt: str, user_content: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # No streamlit, just raise
            raise RuntimeError(f"OpenAI API Error: {str(e)}")

    def basic_summary(self, content: str) -> str:
        system_prompt = """You are a neuro-friendly learning assistant. Create a clear, concise summary that:
        - Uses simple, direct language
        - Breaks down complex concepts into digestible chunks
        - Highlights the most important points
        - Uses bullet points for better readability
        - Keeps sentences short and clear
        - Is suitable for students with attention difficulties"""

        return self._call_openai(system_prompt, f"Summarize this content: {content[:3000]}")

    def story_mode_summary(self, content: str) -> str:
        system_prompt = """🧠 You are a master storytelling tutor trained in neurodiverse education.
Your mission: Convert the topic below into a captivating, emotionally engaging story that teaches concepts in a way that’s fun, memorable, and thrilling for young or neurodiverse learners.
(… full story-mode instructions …)"""

        return self._call_openai(system_prompt, f"Turn this into an engaging story: {content[:3000]}")

    def visual_mode_summary(self, content: str) -> str:
        system_prompt = """🎨 You are an expert in visual and neurodiverse learning.
Create a structured and highly visual summary of the topic below…
(… full visual-mode instructions …)"""

        return self._call_openai(system_prompt, f"Create a visual summary: {content[:3000]}")

    def get_all_summaries(self, content: str) -> Dict[str, str]:
        """Generate all 3 summaries at once (basic, story, visual)"""
        summaries = {}
        print("🧠 Generating Basic Summary...")
        summaries['basic'] = self.basic_summary(content)

        print("📖 Creating Story Mode...")
        summaries['story'] = self.story_mode_summary(content)

        print("🎨 Building Visual Summary...")
        summaries['visual'] = self.visual_mode_summary(content)

        return summaries

    def chunk_content(self, content: str, chunk_size: int = 500) -> List[str]:
        """Split long content into smaller chunks"""
        sentences = re.split(r'[.!?]+', content)
        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk + sentence) < chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks
