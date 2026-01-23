
import google.generativeai as genai
import time
import os

api_key = "AIzaSyCiC9hPnAEEURLn7qedmSL3jIVwiE2ZiPY"
genai.configure(api_key=api_key)

# Minimal valid PDF content
MINIMAL_PDF_BYTES = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 100 Td
(Hello World) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000263 00000 n 
0000000351 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
446
%%EOF"""

pdf_path = "debug_test.pdf"
with open(pdf_path, "wb") as f:
    f.write(MINIMAL_PDF_BYTES)

print(f"Created {pdf_path}")

print("--- Listing Models with generateContent ---")
available_models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            available_models.append(m.name)
except Exception as e:
    print(f"List Error: {e}")

print("\n--- Testing File Upload & Generation ---")

try:
    print("Uploading file...")
    uploaded_file = genai.upload_file(pdf_path, mime_type="application/pdf")
    print(f"Uploaded: {uploaded_file.name}, State: {uploaded_file.state.name}")
    
    while uploaded_file.state.name == "PROCESSING":
        print("Processing...")
        time.sleep(1)
        uploaded_file = genai.get_file(uploaded_file.name)
    
    print(f"Final State: {uploaded_file.state.name}")
    
    if uploaded_file.state.name == "FAILED":
        print("File processing failed on server side.")
    else: 
        # Test models
        test_models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro-latest', 'models/gemini-1.5-flash-001']
        
        for model_name in test_models:
            print(f"\nTesting generate_content with {model_name}...")
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content([uploaded_file, "Summarize this document."])
                print(f"SUCCESS with {model_name}")
                print(f"Response: {response.text}")
                break # Stop at first success
            except Exception as e:
                print(f"FAILED with {model_name}: {e}")

    # Cleanup
    uploaded_file.delete()
    print("\nDeleted remote file.")

except Exception as e:
    print(f"\nCRITICAL FAILURE: {e}")

if os.path.exists(pdf_path):
    os.unlink(pdf_path)
