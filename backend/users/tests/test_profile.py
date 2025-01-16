from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from ..models import UserProfile
import tempfile
from PIL import Image

class ProfileViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create temp profile picture
        self.image = self._create_temp_image()
        
        self.urls = {
            'info': reverse('get_user_info'),
            'update_username': reverse('update_username'),
            'update_password': reverse('update_password'),
            'update_picture': reverse('update_profile_picture'),
            'update_user_info': reverse('update_user_info')
        }

    def _create_temp_image(self):
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            image = Image.new('RGB', (100, 100), 'white')
            image.save(f, 'PNG')
        return open(f.name, 'rb')

    def tearDown(self):
        self.image.close()

    def test_get_user_info(self):
        response = self.client.get(self.urls['info'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_update_user_info(self):
        new_data = {
            'username': 'newusername',
            'email': 'newemail@example.com',
            'name': 'New Name'
        }
        response = self.client.put(self.urls['update_user_info'], new_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, new_data['username'])
        self.assertEqual(self.user.email, new_data['email'])
        self.assertEqual(self.user.first_name, new_data['name'])

    def test_update_password(self):
        data = {
            'old_password': 'testpass123',
            'new_password': 'newtestpass123'
        }
        response = self.client.put(self.urls['update_password'], data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    # def test_update_profile_picture(self):
    #     response = self.client.put(
    #         self.urls['update_picture'],
    #         {'profile_picture': self.image},
    #         format='multipart'
    #     )
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertTrue(UserProfile.objects.get(user=self.user).profile_picture)
