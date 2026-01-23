
import os
import google.generativeai as genai
from PyPDF2 import PdfReader
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from .models import Case, UserProfile, Document, Transaction
from .serializers import CaseSerializer, UserProfileSerializer, DocumentSerializer, TransactionSerializer

# Configure Gemini with API key from environment
api_key = "AIzaSyCiC9hPnAEEURLn7qedmSL3jIVwiE2ZiPY"
if api_key:
    genai.configure(api_key=api_key)

class PDFAnalyzeView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({"error": "Fayl yuborilmadi"}, status=400)
            
        if not api_key:
            return Response({"error": "API_KEY topilmadi"}, status=500)

        try:
            import tempfile
            import time
            import os
            import traceback
            from pathlib import Path
            from google.api_core import exceptions as google_exceptions
            from PyPDF2 import PdfReader, PdfWriter

            # 1. Save uploaded file to unique temp path
            # Using unique suffix to avoid collision
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file_obj.name}") as tmp:
                for chunk in file_obj.chunks():
                    tmp.write(chunk)
                source_path = tmp.name

            file_size_mb = os.path.getsize(source_path) / (1024 * 1024)
            print(f"DEBUG: Processing file {file_obj.name}, Size: {file_size_mb:.2f} MB, Path: {source_path}")

            try:
                reader = PdfReader(source_path)
                total_pages = len(reader.pages)
                if total_pages == 0:
                     raise ValueError("PDF fayli bo'sh (0 sahifa).")
                
                print(f"DEBUG: Total pages: {total_pages}")

                # CHUNKING CONFIGURATION
                CHUNK_SIZE = 20 # User requested 20 pages
                intermediate_summaries = []
                
                # Check model availability first
                model_name = 'gemini-2.0-flash-exp'
                model = genai.GenerativeModel(model_name)

                chunk_errors = []
                for i in range(0, total_pages, CHUNK_SIZE):
                    chunk_start = i
                    chunk_end = min(i + CHUNK_SIZE, total_pages)
                    print(f"DEBUG: Processing chunk {chunk_start+1}-{chunk_end} of {total_pages}...")

                    # Create a temporary PDF for this chunk
                    writer = PdfWriter()
                    for page_num in range(chunk_start, chunk_end):
                        writer.add_page(reader.pages[page_num])
                    
                    chunk_path = f"{source_path}_chunk_{i}.pdf"
                    with open(chunk_path, "wb") as f_out:
                        writer.write(f_out)
                    
                    uploaded_chunk = None
                    try:
                        # Upload chunk
                        print(f"DEBUG: Uploading chunk {i}...")
                        uploaded_chunk = genai.upload_file(chunk_path, mime_type="application/pdf")
                        
                        # Wait for Active
                        max_retries = 30
                        retry_count = 0
                        while uploaded_chunk.state.name == "PROCESSING":
                            if retry_count > max_retries: break
                            time.sleep(1)
                            uploaded_chunk = genai.get_file(uploaded_chunk.name)
                            retry_count += 1
                        
                        if uploaded_chunk.state.name != "ACTIVE":
                             msg = f"Chunk {i} failed processing. State: {uploaded_chunk.state.name}"
                             print(f"WARNING: {msg}")
                             chunk_errors.append(msg)
                             continue

                        # Analyze Chunk
                        chunk_prompt = f"""
                        Ushbu hujjat qismini ({chunk_start+1} dan {chunk_end}-gacha sahifalar) tahlil qil.
                        Bu katta ishning bir qismi.
                        
                        VAZIFA:
                        Faqat shu qismda uchraydigan muhim faktlar, ismlar, sanalar va voqealarni qisqacha yozib ber.
                        Agar muhim ma'lumot bo'lmasa, "Ma'lumot yo'q" deb yoz.
                        """
                        
                        response = model.generate_content([chunk_prompt, uploaded_chunk])
                        if response.text:
                            intermediate_summaries.append(f"--- QISM {chunk_start+1}-{chunk_end} ---\n{response.text}")
                            
                    except Exception as e:
                        msg = f"ERROR analyzing chunk {i}: {str(e)}"
                        print(msg)
                        chunk_errors.append(msg)
                        # Don't stop the whole process, try next chunk
                    finally:
                        # Cleanup remote
                        if uploaded_chunk:
                            try: uploaded_chunk.delete() 
                            except: pass
                        # Cleanup local chunk
                        if os.path.exists(chunk_path):
                            try: os.unlink(chunk_path)
                            except: pass

                # FINAL AGGREGATION
                if not intermediate_summaries:
                    error_details = "; ".join(chunk_errors)
                    raise ValueError(f"Hech qanday qism tahlil qilinmadi. Tafsilotlar: {error_details}")

                final_aggregation_prompt = """
                Quyida katta yuridik ishning qismlarga bo'lib qilingan tahlillari keltirilgan.
                SHULARNI JAMLAB, YAGONA YAKUNIY XULOSA TAYYORLA.

                TALABLAR:
                1. ISHNING MOHIYATI: Nima sodir bo'lgan?
                2. ASOSIY ISHTIROKCHILAR: Kimlar va ularning roli.
                3. XRONOLOGIYA: Voqealar rivoji (sanalar bilan).
                4. YURIDIK TAHLIL VA TAVSIYA: Ishning yechimi qanday bo'lishi kerak?

                TAHLILLAR:
                """ + "\n\n".join(intermediate_summaries)

                # Use text-only generation for final summary (context is now text)
                print("DEBUG: Generating final summary...")
                final_response = model.generate_content(final_aggregation_prompt)

                return Response({
                    "analysis": final_response.text,
                    "pages_processed": total_pages, 
                    "chunks_count": len(intermediate_summaries)
                })

            finally:
                # Cleanup source file
                if source_path and os.path.exists(source_path):
                    try: os.unlink(source_path)
                    except: pass

        except Exception as e:
            print(f"DEBUG: Top Level Error: {e}")
            traceback.print_exc()
            return Response({"error": f"Tahlil xatosi: {str(e)}"}, status=500)

class CaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseSerializer

    def get_queryset(self):
        return Case.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-timestamp')

    @action(detail=False, methods=['post'])
    def topup(self, request):
        """Simulate balance top-up"""
        amount = request.data.get('amount')
        if not amount:
            return Response({'error': 'Amount required'}, status=400)
        
        try:
            amount = float(amount)
            # Create transaction
            Transaction.objects.create(
                user=request.user,
                amount=amount,
                type='CREDIT',
                description='Hisob to\'ldirish (Click/Payme)'
            )
            # Update profile balance
            profile = request.user.profile
            profile.balance = float(profile.balance) + amount
            profile.save()
            
            return Response({'status': 'success', 'new_balance': profile.balance})
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=400)



