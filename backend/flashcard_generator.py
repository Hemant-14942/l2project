
from __future__ import annotations

import re
import os
import json
import random
from datetime import datetime
from typing import List, Dict, Optional

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS


class FlashcardGenerator:
 

    def __init__(self) -> None:
        
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError as e:
            raise RuntimeError(
                "spaCy model 'en_core_web_sm' is not installed.\n"
                "Install with:\n"
                "  pip install spacy\n"
                "  python -m spacy download en_core_web_sm"
            ) from e

    # -------------------------
    # Keyword extraction helpers
    # -------------------------
    def _split_sentences(self, text: str) -> List[str]:
        # Light splitter (handles '.' and newlines). spaCy sentencizer is heavier.
        return [s.strip() for s in re.split(r"[.\n]", text) if s.strip()]

    def _get_top_keywords(self, text: str, top_n: int = 15) -> List[str]:
        """
        Extract top keywords using TF-IDF. Works even for short texts by:
          - Falling back to word-level TF-IDF if only 1 sentence detected
          - Using 1-2 grams
        """
        sentences = self._split_sentences(text)
        if not sentences:
            return []

        # If the text is very short, use a single document to avoid poor features
        docs = sentences if len(sentences) > 1 else [text]

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=top_n,
        )
        try:
            _ = vectorizer.fit_transform(docs)
            return list(vectorizer.get_feature_names_out())
        except ValueError:
            # Happens if text has no valid tokens after stopword filtering
            return []

    def _get_context(self, text: str, term: str, max_len: int = 220) -> str:
        """
        Return a nearby sentence (simple heuristic) that contains the term.
        """
        for sent in self._split_sentences(text):
            if term.lower() in sent.lower():
                return sent[:max_len].strip()
        # fallback: return start of text
        return text[:max_len].strip() if text else ""

    # -------------------------
    # Concept extraction
    # -------------------------
    def extract_key_concepts(self, text: str, limit: int = 20) -> List[Dict]:
        """
        Returns a list of concept dicts:
          - {"term", "type": "entity"/"concept"/"definition", "context"?, "definition"?}
        """
        concepts: List[Dict] = []
        seen: set[str] = set()

        if not text or not text.strip():
            return concepts

        doc = self.nlp(text)
        top_keywords = set(self._get_top_keywords(text))

        # Entities (keep it broad; entity type filtering can miss useful items in academic text)
        for ent in doc.ents:
            term = ent.text.strip()
            key = term.lower()
            if term and key not in seen:
                concepts.append({
                    "term": term,
                    "type": "entity",
                    "context": self._get_context(text, term)
                })
                seen.add(key)

        # Noun chunks (relaxed + overlap with TF-IDF OR 2+ content words)
        for chunk in doc.noun_chunks:
            term = chunk.text.strip()
            key = term.lower()
            if key in seen or len(key) < 3:
                continue

            words = [w for w in re.findall(r"[A-Za-z]+", key) if w not in ENGLISH_STOP_WORDS]
            if not words:
                continue

            keep = (len(words) >= 2)
            if not keep and top_keywords:
                # check unigram and full phrase overlap with TF-IDF vocabulary
                if " ".join(words) in top_keywords or any(w in top_keywords for w in words):
                    keep = True

            if keep:
                concepts.append({
                    "term": term,
                    "type": "concept",
                    "context": self._get_context(text, term)
                })
                seen.add(key)

        # Definitions (regex patterns)
        definition_patterns = [
            r"(.+?)\s+is\s+(.+?)[\.\n]",
            r"(.+?)\s+means\s+(.+?)[\.\n]",
            r"(.+?)\s+refers to\s+(.+?)[\.\n]",
            r"Define\s+(.+?)\s*:\s*(.+?)[\.\n]",
        ]
        for pattern in definition_patterns:
            for m in re.finditer(pattern, text, re.IGNORECASE):
                term = m.group(1).strip()
                definition = m.group(2).strip()
                key = term.lower()

                if (
                    2 <= len(term) <= 60
                    and 10 <= len(definition) <= 300
                    and key not in seen
                ):
                    concepts.append({
                        "term": term,
                        "definition": definition,
                        "type": "definition"
                    })
                    seen.add(key)

        # Deduplicate while preserving order (already handled via 'seen', but limit anyway)
        return concepts[:limit]

    # -------------------------
    # Flashcard generation
    # -------------------------
    def _generate_analytical_questions(self, text: str) -> List[Dict]:
        return [
            {
                "question": "What are the main themes in this content?",
                "answer": "Identify the major ideas and summarize each in one sentence.",
                "type": "analytical",
                "difficulty": "Hard",
            },
            {
                "question": "How do the key concepts relate to each other?",
                "answer": "Describe relationships, cause-effect, or contrasts among ideas.",
                "type": "analytical",
                "difficulty": "Hard",
            },
        ]

    def generate_flashcards(self, text: str, difficulty: str = "Medium") -> List[Dict]:
        """
        Return up to 10 flashcards. If nothing is extracted, fall back to keyword cards.
        """
        if not text or not text.strip():
            return []

        concepts = self.extract_key_concepts(text)
        flashcards: List[Dict] = []

        for concept in concepts:
            term = concept["term"].strip()

            if concept.get("type") == "definition" and concept.get("definition"):
                definition = concept["definition"].strip()
                # Direct definition card
                flashcards.append({
                    "question": f"What is {term}?",
                    "answer": definition,
                    "type": "definition",
                    "difficulty": difficulty,
                })
                # Reverse definition (medium/hard)
                if difficulty in {"Medium", "Hard"}:
                    flashcards.append({
                        "question": f"Which term matches: {definition[:120]} ...?",
                        "answer": term,
                        "type": "reverse_definition",
                        "difficulty": difficulty,
                    })

            else:
                ctx = concept.get("context", "") or self._get_context(text, term)
                flashcards.append({
                    "question": f"Explain: {term}",
                    "answer": ctx,
                    "type": "context",
                    "difficulty": difficulty,
                })

        if difficulty == "Hard":
            flashcards.extend(self._generate_analytical_questions(text))

        # Fallback so the API never returns [] when text exists
        if not flashcards:
            kws = self._get_top_keywords(text, top_n=6)
            for kw in kws:
                if not kw.strip():
                    continue
                ctx = self._get_context(text, kw) or text[:220]
                flashcards.append({
                    "question": f"Define: {kw}",
                    "answer": ctx,
                    "type": "keyword",
                    "difficulty": difficulty,
                })

        # Sample at most 10 (but keep deterministic size if fewer)
        k = min(10, len(flashcards))
        if k <= 0:
            return []
        return random.sample(flashcards, k)

    # -------------------------
    # Performance tracking (optional)
    # -------------------------
    def save_flashcard_performance(
        self,
        user_id: str,
        flashcard: Dict,
        correct: bool,
        response_time: float
    ) -> None:
    
        if not user_id:
            return
        os.makedirs("user_data", exist_ok=True)
        path = os.path.join("user_data", f"{user_id}_flashcard_performance.json")

        data: List[Dict] = []
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                data = []

        data.append({
            "timestamp": datetime.now().isoformat(),
            "question": flashcard.get("question", ""),
            "type": flashcard.get("type", ""),
            "difficulty": flashcard.get("difficulty", ""),
            "correct": bool(correct),
            "response_time": float(response_time),
        })

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_adaptive_difficulty(self, user_id: str) -> str:

        if not user_id:
            return "Medium"

        path = os.path.join("user_data", f"{user_id}_flashcard_performance.json")
        if not os.path.exists(path):
            return "Medium"

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            return "Medium"

        if len(data) < 5:
            return "Medium"

        recent = data[-10:]
        acc = sum(1 for p in recent if p.get("correct")) / len(recent)
        times = [float(p.get("response_time", 0.0)) for p in recent]
        avg_time = sum(times) / len(times) if times else 0.0

        if acc > 0.8 and avg_time < 5:
            return "Hard"
        if acc < 0.5 or avg_time > 15:
            return "Easy"
        return "Medium"


if __name__ == "__main__":
    sample_text = (
        "Photosynthesis is the process by which plants convert light energy into chemical energy. "
        "Chlorophyll absorbs light, primarily in the blue and red wavelengths. "
        "The light-dependent reactions occur in the thylakoid membranes and generate ATP and NADPH. "
        "The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose."
    )

    gen = FlashcardGenerator()
    cards = gen.generate_flashcards(sample_text, difficulty="Medium")
    print(f"Generated {len(cards)} flashcards:")
    for i, c in enumerate(cards, 1):
        print(f"{i}. [{c['type']}] {c['question']} -> {c['answer'][:80]}...")