
import google.generativeai as genai
import os

api_key = "AIzaSyCiC9hPnAEEURLn7qedmSL3jIVwiE2ZiPY"
genai.configure(api_key=api_key)

print("Listing models...")
try:
    for m in genai.list_models():
        print(f"Model: {m.name}")
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - Supports generateContent")
except Exception as e:
    print(f"Error: {e}")
