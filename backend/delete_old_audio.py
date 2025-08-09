import os
import time

AUDIO_DIR = os.path.join(os.getcwd(), "backend", "audio")
MAX_AGE_SECONDS = 86400  # 24 hours

def delete_old_files():
    now = time.time()
    deleted = 0

    for filename in os.listdir(AUDIO_DIR):
        filepath = os.path.join(AUDIO_DIR, filename)
        if not os.path.isfile(filepath):
            continue
        if now - os.path.getmtime(filepath) > MAX_AGE_SECONDS:
            try:
                os.remove(filepath)
                print(f"✅ Deleted: {filename}")
                deleted += 1
            except Exception as e:
                print(f"❌ Error deleting {filename}: {e}")

    print(f"🧹 Cleanup complete. Files deleted: {deleted}")

if __name__ == "__main__":
    delete_old_files()
