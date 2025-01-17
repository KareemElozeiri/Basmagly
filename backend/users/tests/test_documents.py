from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from ..models import Document
import tempfile
from PyPDF2 import PdfWriter

class DocumentViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create test PDF
        self.pdf_file = self._create_test_pdf()
        
        self.urls = {
            'upload': reverse('document_upload'),
            'list': reverse('document_list'),
        }

    def _create_test_pdf(self):
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            writer = PdfWriter()
            writer.add_blank_page(width=72, height=72)
            writer.write(f)
        return open(f.name, 'rb')

    def tearDown(self):
        self.pdf_file.close()

    def test_upload_document(self):
        response = self.client.post(
            self.urls['upload'],
            {'file': self.pdf_file},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Document.objects.filter(user=self.user).exists())

    def test_list_documents(self):
        # Create test documents
        Document.objects.create(
            user=self.user,
            file=self.pdf_file.name,
        )
        
        response = self.client.get(self.urls['list'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_document_detail(self):
        document = Document.objects.create(
            user=self.user,
            file=self.pdf_file.name,
        )
        
        url = reverse('document_detail', kwargs={'pk': document.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_document(self):
        document = Document.objects.create(
            user=self.user,
            file=self.pdf_file.name,
        )
        
        url = reverse('document_detail', kwargs={'pk': document.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Document.objects.filter(pk=document.pk).exists())
