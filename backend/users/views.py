from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate, update_session_auth_hash
from django.contrib.auth.models import User
from .serializers import (
    UserSignupSerializer,
    UserSerializer,
    UserProfileSerializer,
    PasswordUpdateSerializer
)
from .models import UserProfile

class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            return Response({"message": "Login successful."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class UpdateUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        new_username = request.data.get('username')
        if new_username:
            user.username = new_username
            user.save()
            return Response({"message": "Username updated successfully."})
        return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = PasswordUpdateSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.validated_data['old_password']):
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                update_session_auth_hash(request, user)
                return Response({"message": "Password updated successfully."})
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = request.user.userprofile
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile picture updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
