from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.conf import settings
from ..models import Document
from ..serializers import DocumentSerializer
from ..rag import RAGAgent
import os
import PyPDF2

rag_service = RAGAgent()

class BaseRAGView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class DocumentContextView(BaseRAGView):
    def post(self, request):
        document_ids = request.data.get('document_ids', [])
        documents = Document.objects.filter(id__in=document_ids, user=request.user)

        if not documents.exists():
            return Response(
                {"error": "No valid documents found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            docs_for_rag = self._process_documents(documents)
            rag_service.add_documents(docs_for_rag, request.user.id)
            return Response({
                "message": "Documents added to context successfully",
                "document_count": len(docs_for_rag)
            })
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        document_ids = request.data.get('document_ids', [])
        try:
            rag_service.remove_documents(document_ids, request.user.id)
            return Response({
                "message": "Documents removed from context successfully"
            })
        except Exception as e:
            return Response(
                {"error": f"Error removing documents: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _process_documents(self, documents):
        docs_for_rag = []
        serializer = DocumentSerializer(documents, many=True)

        for doc in serializer.data:
            file_path = os.path.join(settings.BASE_DIR, doc['file'][1:])
            content = self._extract_pdf_content(file_path)
            docs_for_rag.append({
                'id': doc['id'],
                'content': content
            })
        return docs_for_rag

    def _extract_pdf_content(self, file_path):
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            return " ".join(page.extract_text() for page in pdf_reader.pages)

class QuizGenerationView(BaseRAGView):
    def post(self, request):
        try:
            num_questions = request.data.get('num_questions', 5)
            questions = rag_service.generate_quiz(
                request.user.id,
                num_questions=num_questions
            )
            
            return Response({
                "quiz": {
                    "questions": questions,
                    "total_questions": len(questions)
                }
            })
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error generating quiz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class QuestionAnsweringView(BaseRAGView):
    def post(self, request):
        question = request.data.get('question')
        if not question:
            return Response(
                {"error": "Question is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            answer_data = rag_service.answer_question(
                question,
                request.user.id
            )
            
            return Response({
                "question": question,
                "answer": answer_data["answer"],
                "supporting_context": answer_data["context"]
            })
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error answering question: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )