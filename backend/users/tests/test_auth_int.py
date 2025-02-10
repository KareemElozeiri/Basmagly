from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token

class AuthenticationIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.profile_url = reverse('get_user_info') 
        self.user_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'securepass123'
        }

    def test_complete_auth_flow(self):
        """Test the complete authentication flow: signup -> login -> access protected route -> logout"""
        
        signup_response = self.client.post(self.signup_url, self.user_data)
        self.assertEqual(signup_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username=self.user_data['username']).exists())
        
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('token', login_response.data)
        
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        
        logout_response = self.client.post(self.logout_url)
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        
        profile_response_after_logout = self.client.get(self.profile_url)
        self.assertEqual(profile_response_after_logout.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_token_reuse(self):
        """Test that expired/logged out tokens cannot be reused"""
        
        user = User.objects.create_user(**self.user_data)
        login_response = self.client.post(self.login_url, {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        token = login_response.data['token']
        
        stored_token = token
        new_client = APIClient()
        new_client.credentials(HTTP_AUTHORIZATION=f'Token {stored_token}')
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
        self.client.post(self.logout_url)
        
        response = new_client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
