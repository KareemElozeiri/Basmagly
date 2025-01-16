from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from django.http import HttpResponse
from ..models import Document
from ..serializers import DocumentSerializer

class BaseDocumentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_user_document(self, pk):
        try:
            return Document.objects.get(pk=pk, user=self.request.user)
        except Document.DoesNotExist:
            return None

class DocumentUploadView(BaseDocumentView):
    def post(self, request):
        serializer = DocumentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentListView(BaseDocumentView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get(self, request):
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DocumentDetailView(BaseDocumentView):
    def get(self, request, pk):
        document = self.get_user_document(pk)
        if not document:
            return Response({"error": "Document not found."}, 
                          status=status.HTTP_404_NOT_FOUND)

        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def delete(self, request, pk):
        document = self.get_user_document(pk)
        if not document:
            return Response({"error": "Document not found."}, 
                          status=status.HTTP_404_NOT_FOUND)

        document.file.delete()
        document.delete()
        return Response({"message": "Document deleted successfully."}, 
                       status=status.HTTP_204_NO_CONTENT)

class DocumentDownloadView(BaseDocumentView):
    def get(self, request, pk):
        document = self.get_user_document(pk)
        if not document:
            return Response({"error": "Document not found."}, 
                          status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(document.file, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{document.file.name}"'
        return response