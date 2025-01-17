from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from ..models import Document
from unittest.mock import patch

class RAGViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        self.document = Document.objects.create(
            user=self.user,
            file='test.pdf',
        )
        
        self.urls = {
            'context': reverse('add_chat_context'), 
            'quiz': reverse('generate_quiz'),
            'qa': reverse('answer_questions')   
        }

    @patch('users.rag.RAGAgent.add_documents')
    def test_add_documents_to_context(self, mock_add_documents):
        data = {'document_ids': [self.document.id]}
        response = self.client.post(self.urls['context'], data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_add_documents.assert_called_once()

    @patch('users.rag.RAGAgent.remove_documents')
    def test_remove_documents_from_context(self, mock_remove_documents):
        data = {'document_ids': [self.document.id]}
        response = self.client.delete(self.urls['context'], data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_remove_documents.assert_called_once()

    @patch('users.rag.RAGAgent.generate_quiz')
    def test_generate_quiz(self, mock_generate_quiz):
        mock_generate_quiz.return_value = [
            {'question': 'Test Q1', 'answer': 'Test A1'},
            {'question': 'Test Q2', 'answer': 'Test A2'}
        ]
        
        data = {'num_questions': 2}
        response = self.client.post(self.urls['quiz'], data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['quiz']['questions']), 2)

    @patch('users.rag.RAGAgent.answer_question')
    def test_question_answering(self, mock_answer_question):
        mock_answer_question.return_value = {
            'answer': 'Test answer',
            'context': 'Test context'
        }
        
        data = {'question': 'Test question?'}
        response = self.client.post(self.urls['qa'], data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('answer', response.data)
        self.assertIn('supporting_context', response.data)
