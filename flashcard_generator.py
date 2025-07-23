import spacy
import random
import re
from typing import List, Dict
from datetime import datetime
import json
import os
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer


class FlashcardGenerator:
    def __init__(self):
        self.nlp = None
        self.setup_spacy()

    def setup_spacy(self):
        """Initialize spaCy model"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except IOError:
            st.warning("spaCy model not found. Installing...")
            os.system("python -m spacy download en_core_web_sm")
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except:
                st.error("Could not load spaCy model. Flashcards will use basic mode.")

    def _get_top_keywords(self, text: str, top_n: int = 15) -> List[str]:
        """Extract top keywords using TF-IDF"""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        vectorizer = TfidfVectorizer(stop_words='english', max_features=top_n)
        tfidf_matrix = vectorizer.fit_transform(sentences)
        return vectorizer.get_feature_names_out()

    def _get_context(self, text: str, term: str) -> str:
        """Get surrounding context for a term"""
        sentences = text.split('.')
        for sentence in sentences:
            if term.lower() in sentence.lower():
                return sentence.strip()[:200]
        return ""

    def extract_key_concepts(self, text: str) -> List[Dict]:
        """Extract key concepts and definitions from text"""
        concepts = []
        seen_terms = set()

        if not self.nlp:
            return concepts

        doc = self.nlp(text)
        top_keywords = self._get_top_keywords(text)

        # Named entities
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "WORK_OF_ART", "LAW"]:
                if ent.text.lower() not in seen_terms:
                    concepts.append({
                        "term": ent.text,
                        "type": "entity",
                        "context": self._get_context(text, ent.text)
                    })
                    seen_terms.add(ent.text.lower())

        # Noun chunks filtered by TF-IDF
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip().lower()
            if (
                len(chunk_text.split()) > 1 and
                any(kw in chunk_text for kw in top_keywords) and
                chunk_text not in seen_terms
            ):
                concepts.append({
                    "term": chunk.text,
                    "type": "concept",
                    "context": self._get_context(text, chunk.text)
                })
                seen_terms.add(chunk_text)

        # Definition patterns
        definition_patterns = [
            r'(.+?) is (.+?)[\.\n]',
            r'(.+?) means (.+?)[\.\n]',
            r'(.+?) refers to (.+?)[\.\n]',
            r'Define (.+?): (.+?)[\.\n]'
        ]

        for pattern in definition_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                term = match.group(1).strip()
                definition = match.group(2).strip()

                if (
                    len(term) < 40 and len(definition) < 250 and
                    any(kw in term.lower() for kw in top_keywords) and
                    term.lower() not in seen_terms
                ):
                    concepts.append({
                        "term": term,
                        "definition": definition,
                        "type": "definition"
                    })
                    seen_terms.add(term.lower())

        return concepts[:20]

    def generate_flashcards(self, text: str, difficulty: str = "Medium") -> List[Dict]:
        """Generate adaptive flashcards based on difficulty level"""
        concepts = self.extract_key_concepts(text)
        flashcards = []

        for concept in concepts:
            term = concept['term'].strip()
            if concept.get("type") == "definition":
                flashcards.append({
                    "question": f"What is {term}?",
                    "answer": concept["definition"],
                    "type": "definition",
                    "difficulty": difficulty
                })
                if difficulty in ["Medium", "Hard"]:
                    flashcards.append({
                        "question": f"Which term is defined as: {concept['definition'][:100]}...?",
                        "answer": term,
                        "type": "reverse_definition",
                        "difficulty": difficulty
                    })

            elif concept.get("context"):
                flashcards.append({
                    "question": f"Complete the concept: {term}",
                    "answer": concept["context"],
                    "type": "context",
                    "difficulty": difficulty
                })

        if difficulty == "Hard":
            flashcards.extend(self._generate_analytical_questions(text))

        return random.sample(flashcards, min(10, len(flashcards)))

    def _generate_analytical_questions(self, text: str) -> List[Dict]:
        return [
            {
                "question": "What are the main themes in this content?",
                "answer": "Analyze the key themes and concepts presented.",
                "type": "analytical",
                "difficulty": "Hard"
            },
            {
                "question": "How do the concepts relate to each other?",
                "answer": "Consider the connections and relationships between ideas.",
                "type": "analytical",
                "difficulty": "Hard"
            }
        ]

    def save_flashcard_performance(self, user_id: str, flashcard: Dict, correct: bool, response_time: float):
        """Save flashcard performance for adaptation"""
        os.makedirs("user_data", exist_ok=True)
        performance_file = f"user_data/{user_id}_flashcard_performance.json"

        performance_data = []
        if os.path.exists(performance_file):
            with open(performance_file, 'r') as f:
                performance_data = json.load(f)

        performance_data.append({
            "timestamp": datetime.now().isoformat(),
            "question": flashcard["question"],
            "type": flashcard["type"],
            "difficulty": flashcard["difficulty"],
            "correct": correct,
            "response_time": response_time
        })

        with open(performance_file, 'w') as f:
            json.dump(performance_data, f, indent=2)

    def get_adaptive_difficulty(self, user_id: str) -> str:
        """Determine adaptive difficulty based on performance"""
        performance_file = f"user_data/{user_id}_flashcard_performance.json"
        if not os.path.exists(performance_file):
            return "Medium"

        with open(performance_file, 'r') as f:
            performance_data = json.load(f)

        if len(performance_data) < 5:
            return "Medium"

        recent = performance_data[-10:]
        accuracy = sum(p["correct"] for p in recent) / len(recent)
        avg_time = sum(p["response_time"] for p in recent) / len(recent)

        if accuracy > 0.8 and avg_time < 5:
            return "Hard"
        elif accuracy < 0.5 or avg_time > 15:
            return "Easy"
        return "Medium"
