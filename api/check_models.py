"""List available Gemini models for the configured API key."""

import os
import sys

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("ERROR: GOOGLE_API_KEY not set in environment or .env file.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

print("Fetching available Gemini models...")
try:
    for m in client.models.list():
        actions = m.supported_actions or []
        if "generateContent" in actions:
            # pyrefly: ignore [missing-attribute]
            name = m.name.replace("models/", "")
            print(f"  [OK] {name}")
except Exception as e:
    print(f"Error: {e}")