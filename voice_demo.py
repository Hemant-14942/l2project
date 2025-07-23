"""
Voice-to-Voice AI Coach Demo
Simple demonstration of the voice coaching capabilities
"""

import streamlit as st
import tempfile
import os
from voice_to_voice_coach import VoiceToVoiceCoach
from config import DEFAULT_USER_ID

# Page config
st.set_page_config(
    page_title="Voice AI Coach Demo",
    page_icon="🎙️",
    layout="wide"
)

# Initialize voice coach
if 'voice_coach' not in st.session_state:
    st.session_state.voice_coach = VoiceToVoiceCoach(DEFAULT_USER_ID)

voice_coach = st.session_state.voice_coach

# Header
st.title("🎙️ Voice-to-Voice AI Coach Demo")
st.markdown("*Test the voice coaching functionality with your AI learning assistant*")

# Check credentials
if not os.getenv("AZURE_OPENAI_API_KEY"):
    st.error("⚠️ Azure OpenAI credentials not found. Please check your .env file.")
    st.stop()

st.success("✅ Azure OpenAI credentials loaded successfully!")

# Voice session status
voice_status = voice_coach.get_session_status()

col1, col2 = st.columns(2)

with col1:
    if voice_status["active"]:
        st.success("🎙️ Voice Session: Active")
        st.metric("Messages Exchanged", voice_status.get("message_count", 0))
    else:
        st.info("🔇 Voice Session: Inactive")

with col2:
    if voice_status["session_id"]:
        st.metric("Session ID", voice_status["session_id"][-8:])

# Session controls
col1, col2 = st.columns(2)

with col1:
    if st.button("🎙️ Start Voice Session", type="primary", disabled=voice_status["active"]):
        result = voice_coach.start_voice_session()
        if result["status"] == "success":
            st.success(result["message"])
            st.rerun()
        else:
            st.error(result["message"])

with col2:
    if st.button("🔇 Stop Voice Session", disabled=not voice_status["active"]):
        result = voice_coach.stop_voice_session()
        if result["status"] == "success":
            st.success(result["message"])
            st.rerun()
        else:
            st.error(result["message"])

st.markdown("---")

# Voice interaction
if voice_status["active"]:
    st.markdown("### 🎤 Voice Interaction")

    # Audio file upload
    audio_file = st.file_uploader(
        "Upload your voice message (wav, mp3, m4a)",
        type=['wav', 'mp3', 'm4a'],
        help="Record a voice message and upload it here to chat with your AI coach"
    )

    if audio_file is not None:
        with st.spinner("🎵 Processing your voice message..."):
            # Read audio file
            audio_bytes = audio_file.read()

            # Process with voice coach
            result = voice_coach.process_audio_input(audio_bytes)

            if result["status"] == "success":
                st.success("✅ Voice message processed successfully!")

                # Show conversation
                col1, col2 = st.columns(2)

                with col1:
                    st.markdown("**🗣️ You said:**")
                    st.info(result["user_text"])

                with col2:
                    st.markdown("**🤖 AI Coach replied:**")
                    st.success(result["ai_response"])

                # Show audio response if available
                if result.get("audio_response"):
                    st.markdown("**🔊 Listen to AI Coach response:**")
                    try:
                        st.audio(result["audio_response"])
                    except Exception as e:
                        st.warning(f"Audio playback not available: {e}")

            else:
                st.error(f"❌ Error processing voice: {result['message']}")

    # Text input for testing (fallback)
    st.markdown("### 💬 Text Input (for testing)")
    text_input = st.text_input("Type a message to test the AI coach:", placeholder="Ask me about learning topics...")

    if st.button("💬 Send Text Message") and text_input:
        with st.spinner("🤖 AI Coach is thinking..."):
            # Simulate processing text as voice (for testing)
            try:
                response = voice_coach._generate_ai_response(text_input)
                voice_coach._add_to_conversation(text_input, response)

                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("**💬 You wrote:**")
                    st.info(text_input)
                with col2:
                    st.markdown("**🤖 AI Coach replied:**")
                    st.success(response)

            except Exception as e:
                st.error(f"Error: {e}")

    # Show conversation history
    conversation_history = voice_coach.get_conversation_history(5)
    if conversation_history:
        st.markdown("### 📜 Recent Conversation History")

        for i, exchange in enumerate(reversed(conversation_history)):
            with st.expander(f"Exchange {len(conversation_history)-i} - {exchange['timestamp'][:16]}"):
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("**🗣️ You:**")
                    st.write(exchange["user_text"])
                with col2:
                    st.markdown("**🤖 Coach:**")
                    st.write(exchange["ai_response"])

else:
    st.info("👆 Start a voice session to begin chatting with your AI coach!")

    # Show demo information
    st.markdown("### 🌟 Voice Coaching Features:")

    features = [
        "🗣️ **Natural Speech Recognition**: Upload audio files and get transcribed text",
        "🤖 **AI-Powered Responses**: Get personalized coaching responses from GPT-4.1",
        "🔊 **Text-to-Speech**: Hear the AI coach's responses in voice",
        "📚 **Learning Context**: AI remembers your conversation and adapts responses",
        "🎯 **Educational Focus**: Specialized for learning and educational support",
        "💪 **Motivational Coaching**: Encouraging and supportive communication style"
    ]

    for feature in features:
        st.markdown(feature)

    st.markdown("### 🎙️ How to Test:")
    steps = [
        "1. Click **'Start Voice Session'** above",
        "2. Record a voice message on your device (ask a learning question)",
        "3. Upload the audio file using the file uploader",
        "4. Watch as the AI transcribes your speech and responds",
        "5. Listen to the AI's voice response",
        "6. Continue the conversation!"
    ]

    for step in steps:
        st.markdown(step)

    st.markdown("### 💡 Example Questions to Try:")
    examples = [
        "🔬 *Explain how photosynthesis works*",
        "📊 *Help me understand calculus derivatives*",
        "🌍 *Tell me about the French Revolution*",
        "💻 *How do I learn programming effectively?*",
        "🧠 *What are good study techniques for memorization?*"
    ]

    for example in examples:
        st.markdown(example)

# Sidebar with technical info
with st.sidebar:
    st.markdown("## 🛠️ Technical Info")

    st.markdown("**🔧 Backend:**")
    st.markdown("- Azure OpenAI GPT-4.1")
    st.markdown("- OpenAI Whisper (Speech-to-Text)")
    st.markdown("- pyttsx3 (Text-to-Speech)")
    st.markdown("- LiveKit (Real-time Audio)")

    st.markdown("**📊 Session Status:**")
    if voice_status["active"]:
        st.success("Active")
        st.metric("Messages", voice_status["message_count"])
        if voice_status["last_activity"]:
            st.caption(f"Last: {voice_status['last_activity'][:16]}")
    else:
        st.info("Inactive")

    st.markdown("**🎯 Capabilities:**")
    st.markdown("- ✅ Voice Input Processing")
    st.markdown("- ✅ AI Response Generation")
    st.markdown("- ✅ Voice Output (TTS)")
    st.markdown("- ✅ Conversation Memory")
    st.markdown("- 🚧 Real-time Audio (LiveKit)")

    st.markdown("---")
    st.caption("Voice-to-Voice AI Coach v1.0")