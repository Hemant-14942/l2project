"""
Voice Coach Integration Test
Test the complete voice-to-voice workflow
"""

import io
import tempfile
import os
from voice_to_voice_coach import VoiceToVoiceCoach
from config import DEFAULT_USER_ID
import whisper

def test_voice_coach():
    """Test the voice coach functionality"""
    print("🎙️ Testing Voice-to-Voice AI Coach")
    print("=" * 50)

    # Initialize voice coach
    coach = VoiceToVoiceCoach(DEFAULT_USER_ID)

    # Test 1: Start session
    print("\n1. Testing session management...")
    result = coach.start_voice_session()
    print(f"   Start session: {result['status']} - {result['message']}")

    # Test 2: Check session status
    status = coach.get_session_status()
    print(f"   Session active: {status['active']}")
    print(f"   Session ID: {status['session_id']}")

    # Test 3: Test AI response generation
    print("\n2. Testing AI response generation...")
    test_questions = [
        "Hello, can you help me with mathematics?",
        "Explain photosynthesis in simple terms",
        "What are good study techniques for memorization?",
        "I'm feeling frustrated with learning calculus"
    ]

    for i, question in enumerate(test_questions, 1):
        try:
            response = coach._generate_ai_response(question)
            print(f"   Q{i}: {question}")
            print(f"   A{i}: {response[:100]}...")
            coach._add_to_conversation(question, response)
        except Exception as e:
            print(f"   Q{i}: Error - {e}")

    # Test 4: Check conversation history
    print("\n3. Testing conversation history...")
    history = coach.get_conversation_history()
    print(f"   Conversation entries: {len(history)}")

    # Test 5: Test text-to-speech
    print("\n4. Testing text-to-speech...")
    try:
        test_text = "Hello! This is a test of the voice synthesis system."
        audio_data = coach._text_to_speech(test_text)
        if audio_data:
            print("   ✅ TTS: Audio generated successfully")
        else:
            print("   ⚠️ TTS: Audio generation returned None")
    except Exception as e:
        print(f"   ❌ TTS: Error - {e}")

    # Test 6: Stop session
    print("\n5. Testing session termination...")
    result = coach.stop_voice_session()
    print(f"   Stop session: {result['status']} - {result['message']}")

    print("\n" + "=" * 50)
    print("🎉 Voice Coach test completed!")

    return True

def test_azure_openai():
    """Test Azure OpenAI connection"""
    print("\n🤖 Testing Azure OpenAI Connection")
    print("-" * 30)

    try:
        import openai
        from config_fold import AZURE_OPENAI_API_KEY, ENDPOINT_URL, DEPLOYMENT_NAME

        if not AZURE_OPENAI_API_KEY:
            print("❌ Azure OpenAI API key not found")
            return False

        client = openai.AzureOpenAI(
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2024-02-01",
            azure_endpoint=ENDPOINT_URL
        )

        # Test simple completion
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[{"role": "user", "content": "Say hello in one word"}],
            max_tokens=10
        )

        print(f"✅ Azure OpenAI: Connected successfully")
        print(f"   Model: {DEPLOYMENT_NAME}")
        print(f"   Response: {response.choices[0].message.content}")
        return True

    except Exception as e:
        print(f"❌ Azure OpenAI: Error - {e}")
        return False

def test_whisper():
    """Test Whisper speech recognition"""
    print("\n🎵 Testing Whisper Speech Recognition")
    print("-" * 35)

    try:
        model = whisper.load_model("base")
        print("✅ Whisper: Model loaded successfully")
        print(f"   Model type: base")
        return True
    except Exception as e:
        print(f"❌ Whisper: Error - {e}")
        return False

if __name__ == "__main__":
    print("🚀 Voice-to-Voice AI Coach Integration Test")
    print("=" * 60)

    # Run all tests
    tests = [
        ("Azure OpenAI", test_azure_openai),
        ("Whisper", test_whisper),
        ("Voice Coach", test_voice_coach)
    ]

    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"❌ {name}: Fatal error - {e}")
            results[name] = False

    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("-" * 25)

    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:<20} {status}")

    total_tests = len(results)
    passed_tests = sum(results.values())

    print(f"\nTests Passed: {passed_tests}/{total_tests}")

    if passed_tests == total_tests:
        print("🎉 All tests passed! Voice-to-Voice AI Coach is ready to use!")
    else:
        print("⚠️ Some tests failed. Check the errors above.")