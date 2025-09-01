import openai
import re
import streamlit as st
from typing import Dict, List
from config_fold import AZURE_OPENAI_API_KEY, ENDPOINT_URL, DEPLOYMENT_NAME

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
            st.error(f"API Error: {str(e)}")
            return f"Error generating summary: {str(e)}"

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

🎯 Story Style Requirements:

Format:
📚 A story, not a lecture. Make it feel like an adventure, mystery, or fable.
Use a protagonist (a kid, a robot, a wizard, etc.) who goes on a journey to understand the topic.

Tone:
🗣 Conversational — like explaining to a curious friend over a campfire.
Use fun phrases, cliffhangers, and reactions like "Wait, what just happened?!" or "And guess what happened next..."

Techniques to Include:

🧩 Analogies (e.g., “Imagine your brain is like a messy desk…”)

🪄 Metaphors (e.g., “Data was the treasure, and the algorithm was the map.”)

🛤 Story bridges — weave scenes so ideas flow naturally

🎯 Memory hooks — use quirky characters, rhymes, or silly mnemonics

🌍 Real-world examples to ground abstract ideas

Characters & Emotion:

Introduce at least 1 relatable character 🧑‍🚀

Show their struggles, discoveries, and “aha!” moments

Make the audience feel excitement, curiosity, surprise

Learning Outcome:
At the end, summarize the key concepts in a way the main character “learns a lesson” — something the reader also remembers.

📦 Example Memory Hook Style:

"So every time Mia sees a locked door, she remembers:
🔐 'Encryption keeps secrets safe!'
And that’s how she never forgot what cryptography meant."

🔍 Topic to turn into a story:
{{INSERT YOUR TOPIC HERE}}

🧩 Example Fill-In:
You can replace the last line with something like:

How Neural Networks work

Or

The concept of Gravity for kids"""

        return self._call_openai(system_prompt, f"Turn this into an engaging story: {content[:3000]}")

    def visual_mode_summary(self, content: str) -> str:
        system_prompt = """🎨 You are an expert in visual and neurodiverse learning.

Create a structured and highly visual summary of the topic below that meets the following criteria:

🔹 Format Requirements (Non-Negotiable):

Use emojis generously to represent concepts, categories, and actions (e.g., 📊, 🧠, 🔄, 🔥, 📌, ✅).

Create visual hierarchies using:

🔸Headings

🔹Sub-points

⮞ Arrows and branches for connections

⬇️ Indented bullet trees for structure

Use visual separators like lines, boxes, or emoji lines:

Copy
Edit
═══════════════════════════════
Highlight critical info with color cues in text:

🔴 Important

🟡 Caution

🔵 Detail / Fact

🟢 Tip / Hack

Include mind-map style logic:

📌 Central ideas → 🧠 Concepts → 🔄 Processes → ✅ Examples

Use ⤵️ and ⤴️ for navigation and relationship

If helpful, include text-based diagrams, e.g.:

lua
Copy
Edit
🧠 MEMORY PROCESS
   |
   |--> 🟢 Encode
   |--> 🔵 Store
   |--> 🔴 Retrieve
Break up dense paragraphs into:

✂️ Digestible chunks

🪄 Keyword highlights

🔁 Recaps and 🔄 Flow summaries

End with a 📦 "Quick Recap Box" that summarizes everything using just:

Emojis

Keywords

One-liner visuals

👇 Topic to visualize:
{{INSERT YOUR TOPIC HERE}}

💡 Example Use:
Replace {{INSERT YOUR TOPIC HERE}} with any subject you want to learn, e.g.:

The K-Means Clustering Algorithm"""

        return self._call_openai(system_prompt, f"Create a visual summary: {content[:3000]}")

    def get_all_summaries(self, content: str) -> Dict[str, str]:
        summaries = {}

        with st.spinner("🧠 Generating Basic Summary..."):
            summaries['basic'] = self.basic_summary(content)

        with st.spinner("📖 Creating Story Mode..."):
            summaries['story'] = self.story_mode_summary(content)

        with st.spinner("🎨 Building Visual Summary..."):
            summaries['visual'] = self.visual_mode_summary(content)

        return summaries

    def chunk_content(self, content: str, chunk_size: int = 500) -> List[str]:
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
