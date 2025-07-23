import os
import json
import base64
import random
from datetime import datetime
from typing import Dict, List, Optional
from PIL import Image, ImageDraw, ImageFont
import io
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import seaborn as sns


class VisualFeedbackManager:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.badges_file = f"user_data/{user_id}_badges.json"
        self.achievements_file = f"user_data/{user_id}_achievements.json"
        self.colors = {
            "success": "#4CAF50",
            "warning": "#FF9800",
            "error": "#F44336",
            "info": "#2196F3",
            "achievement": "#FFD700",
            "motivation": "#9C27B0"
        }

    def get_contextual_feedback(self, context: str, performance_data: Dict) -> Dict:
        """Get contextual visual feedback based on performance"""
        feedback = {
            "message": "",
            "image": None,
            "badge": None,
            "color": "info"
        }

        if context == "quiz_result":
            return self._get_quiz_feedback(performance_data)
        elif context == "learning_streak":
            return self._get_streak_feedback(performance_data)
        elif context == "concept_mastery":
            return self._get_mastery_feedback(performance_data)
        elif context == "focus_session":
            return self._get_focus_feedback(performance_data)

        return feedback

    def _get_quiz_feedback(self, performance_data: Dict) -> Dict:
        """Generate quiz-specific feedback"""
        correct = performance_data.get("correct", False)
        response_time = performance_data.get("response_time", 0)

        if correct:
            if response_time < 3:
                message = "⚡ Lightning fast! You really know this!"
                mood = "excellent"
            elif response_time < 8:
                message = "✅ Correct! Well done!"
                mood = "good"
            else:
                message = "✅ Correct! Take your time, accuracy matters!"
                mood = "thoughtful"
        else:
            message = "💡 Learning opportunity! Review and try again."
            mood = "encouraging"

        image = self.create_meme_image("quiz_feedback", message, mood)

        return {
            "message": message,
            "image": image,
            "badge": self._check_for_badge_unlock("quiz", performance_data),
            "color": "success" if correct else "info"
        }

    def _get_streak_feedback(self, performance_data: Dict) -> Dict:
        """Generate streak-specific feedback"""
        streak_days = performance_data.get("streak_days", 0)

        if streak_days >= 10:
            message = "🏆 LEGENDARY STREAK! You're unstoppable!"
            mood = "legendary"
        elif streak_days >= 7:
            message = "🔥 Week-long streak! Amazing dedication!"
            mood = "fire"
        elif streak_days >= 3:
            message = "⭐ Building momentum! Keep it up!"
            mood = "building"
        else:
            message = "🌟 Great start! Every day counts!"
            mood = "starting"

        image = self.create_meme_image("streak", message, mood)

        return {
            "message": message,
            "image": image,
            "badge": self._check_for_badge_unlock("streak", performance_data),
            "color": "achievement"
        }

    def _get_focus_feedback(self, performance_data: Dict) -> Dict:
        """Generate focus session feedback"""
        focus_time = performance_data.get("focus_time", 0)
        breaks = performance_data.get("breaks", 0)

        if focus_time > 1800:  # 30 minutes
            message = "🎯 Deep focus achieved! Excellent concentration!"
            mood = "focused"
        elif focus_time > 900:  # 15 minutes
            message = "💪 Good focus session! Building your attention!"
            mood = "good"
        else:
            message = "🌱 Great start! Focus grows with practice!"
            mood = "growing"

        image = self.create_meme_image("focus_session", message, mood)

        return {
            "message": message,
            "image": image,
            "badge": self._check_for_badge_unlock("focus", performance_data),
            "color": "success"
        }

    def create_meme_image(self, category: str, text: str, mood: str) -> str:
        """Create motivational meme image"""
        try:
            # Create a colorful background
            fig, ax = plt.subplots(figsize=(6, 4))

            # Choose colors based on mood
            if mood in ["excellent", "legendary", "fire"]:
                bg_color = "#FFD700"  # Gold
                text_color = "#333"
            elif mood in ["good", "building", "focused"]:
                bg_color = "#4CAF50"  # Green
                text_color = "white"
            elif mood in ["encouraging", "growing", "starting"]:
                bg_color = "#2196F3"  # Blue
                text_color = "white"
            else:
                bg_color = "#9C27B0"  # Purple
                text_color = "white"

            # Create background
            ax.set_facecolor(bg_color)
            ax.set_xlim(0, 10)
            ax.set_ylim(0, 10)

            # Add decorative elements
            self._add_decorative_elements(ax, mood)

            # Add text
            ax.text(5, 5, text, ha='center', va='center',
                    fontsize=12, fontweight='bold', color=text_color,
                    wrap=True, bbox=dict(boxstyle="round,pad=0.3",
                                         facecolor="white", alpha=0.8))

            # Remove axes
            ax.set_xticks([])
            ax.set_yticks([])
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_visible(False)
            ax.spines['left'].set_visible(False)

            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return image_base64

        except Exception as e:
            print(f"Error creating meme image: {e}")
            return ""

    def _add_decorative_elements(self, ax, mood: str):
        """Add decorative elements based on mood"""
        if mood in ["excellent", "legendary"]:
            # Add stars
            star_positions = [(2, 8), (8, 8), (1, 2), (9, 2), (5, 9)]
            for x, y in star_positions:
                ax.plot(x, y, marker='*', markersize=20, color='yellow')

        elif mood in ["fire", "building"]:
            # Add flame-like shapes
            for i in range(3):
                x = 2 + i * 3
                flame = patches.Ellipse((x, 1), 0.5, 1.5, color='orange', alpha=0.7)
                ax.add_patch(flame)

        elif mood == "focused":
            # Add target/bullseye
            circle1 = patches.Circle((5, 2), 1.5, color='red', alpha=0.3)
            circle2 = patches.Circle((5, 2), 1.0, color='white', alpha=0.7)
            circle3 = patches.Circle((5, 2), 0.5, color='red', alpha=0.5)
            ax.add_patch(circle1)
            ax.add_patch(circle2)
            ax.add_patch(circle3)

    def create_progress_visualization(self, progress_data: Dict) -> str:
        """Create progress visualization"""
        try:
            fig, ax = plt.subplots(figsize=(8, 6))

            # Create progress bar
            total = progress_data.get("total_concepts", 100)
            completed = progress_data.get("mastered_concepts", 0)
            progress = completed / total if total > 0 else 0

            # Progress bar
            bar_width = 0.6
            ax.barh(0, progress, bar_width, color='#4CAF50', alpha=0.8)
            ax.barh(0, 1 - progress, bar_width, left=progress, color='#E0E0E0', alpha=0.3)

            # Add percentage text
            ax.text(0.5, 0, f'{progress:.1%}', ha='center', va='center',
                    fontsize=16, fontweight='bold', color='white')

            # Styling
            ax.set_xlim(0, 1)
            ax.set_ylim(-0.5, 0.5)
            ax.set_title('Learning Progress', fontsize=18, fontweight='bold', pad=20)
            ax.set_xlabel('Progress', fontsize=12)
            ax.set_yticks([])
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_visible(False)

            # Convert to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()

            return image_base64

        except Exception as e:
            print(f"Error creating progress visualization: {e}")
            return ""

    def get_daily_motivation_visual(self) -> Dict:
        """Get daily motivational visual"""
        motivational_messages = [
            "🌟 Every expert was once a beginner!",
            "🚀 Progress, not perfection!",
            "💪 Your brain grows with every challenge!",
            "🎯 Focus on the journey, not just the destination!",
            "🌱 Small steps lead to big achievements!",
            "⭐ You're building something amazing!",
            "🔥 Consistency beats intensity!",
            "💡 Every question makes you smarter!"
        ]

        # Choose message based on day to provide variety
        day_of_year = datetime.now().timetuple().tm_yday
        message = motivational_messages[day_of_year % len(motivational_messages)]

        image = self.create_meme_image("daily_motivation", message, "motivation")

        return {
            "text": message,
            "image": image
        }

    def _check_for_badge_unlock(self, category: str, performance_data: Dict) -> Optional[Dict]:
        """Check if user unlocked a new badge"""
        # Simple badge system
        badges = self._load_badges()

        if category == "quiz" and performance_data.get("correct", False):
            quiz_count = badges.get("quiz_correct", 0) + 1
            badges["quiz_correct"] = quiz_count

            if quiz_count == 10:
                badge = {
                    "title": "Quiz Master",
                    "description": "Answered 10 questions correctly!",
                    "image": self.create_meme_image("badge", "Quiz Master Unlocked!", "achievement"),
                    "points": 50
                }
                self._save_badges(badges)
                return badge

        elif category == "streak":
            streak_days = performance_data.get("streak_days", 0)
            if streak_days == 7:
                badge = {
                    "title": "Week Warrior",
                    "description": "Maintained a 7-day learning streak!",
                    "image": self.create_meme_image("badge", "Week Warrior!", "achievement"),
                    "points": 100
                }
                return badge

        return None

    def _load_badges(self) -> Dict:
        """Load user badges"""
        if os.path.exists(self.badges_file):
            with open(self.badges_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_badges(self, badges: Dict):
        """Save user badges"""
        with open(self.badges_file, 'w') as f:
            json.dump(badges, f, indent=2)

    def get_user_achievements(self) -> Dict:
        """Get user achievements summary"""
        badges = self._load_badges()

        # Calculate recent badges (last 5)
        recent_badges = []
        total_points = 0

        # This is a simplified version - you'd want to store more detailed badge history
        for badge_type, count in badges.items():
            if badge_type == "quiz_correct" and count >= 10:
                recent_badges.append({"title": "Quiz Master", "points": 50})
                total_points += 50

        return {
            "total_badges": len(recent_badges),
            "total_points": total_points,
            "recent_badges": recent_badges
        }