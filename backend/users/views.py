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
    PasswordUpdateSerializer,
    DocumentSerializer
)
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from .models import UserProfile, Document
from django.http import HttpResponse


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
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"message": "Login successful.", "token": token.key}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

class UserLogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the user's token on logout
        try:
            # Delete current token
            request.user.auth_token.delete()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Unable to logout."}, status=status.HTTP_400_BAD_REQUEST)

class UpdateUsernameView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        new_username = request.data.get('username')
        if new_username:
            # Check if the new username is already taken
            if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
                return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            user.username = new_username
            user.save()
            return Response({"message": "Username updated successfully."})
        return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

class UserInfoView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # The authenticated user making the request
        
        # Collect user details
        user_info = {
            "username": user.username,
            "email": user.email,
        }
        
        try:
            profile = user.userprofile  # Assumes a OneToOne relationship with User
            user_info.update({
                "profile_picture": profile.profile_picture.url if profile.profile_picture else None
            })
        except AttributeError:
            # Handle if UserProfile does not exist
            user_info.update({"profile_picture": None})

        return Response(user_info, status=status.HTTP_200_OK)



class UpdatePasswordView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        # Pass the request to the serializer context to allow validation
        serializer = PasswordUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Delete old token and create a new one
            Token.objects.filter(user=user).delete()
            new_token = Token.objects.create(user=user)
            
            return Response({
                "message": "Password updated successfully.", 
                "token": new_token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfilePictureView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = request.user.userprofile
        # Ensure the request contains the file in 'profile_picture'
        serializer = UserProfileSerializer(profile, data=request.data, 
                                           partial=True, 
                                           context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile picture updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class DocumentUploadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Pass request to serializer context for user validation
        serializer = DocumentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentListView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure only documents of the logged-in user are returned
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DocumentDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Ensure document belongs to the logged-in user
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DocumentSerializer(document)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            # Ensure document belongs to the logged-in user
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        document.file.delete()  # Deletes the file from storage
        document.delete()
        return Response({"message": "Document deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class DocumentDownloadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Ensure document belongs to the logged-in user
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(document.file, content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{document.file.name}"'
        return response