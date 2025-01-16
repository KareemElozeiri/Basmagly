from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth.models import User
from ..serializers import (
    UserProfileSerializer, 
    PasswordUpdateSerializer
)
from rest_framework.authtoken.models import Token

class BaseProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

class UserInfoView(BaseProfileView):
    def get(self, request):
        user = request.user
        user_info = {
            "username": user.username,
            "email": user.email,
        }
        
        try:
            profile = user.userprofile
            user_info.update({
                "profile_picture": profile.profile_picture.url if profile.profile_picture else None
            })
        except AttributeError:
            user_info.update({"profile_picture": None})

        return Response(user_info, status=status.HTTP_200_OK)
    

class UpdateUsernameView(BaseProfileView):
    def put(self, request):
        user = request.user
        new_username = request.data.get('username')
        
        if not new_username:
            return Response({"error": "Username is required."}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
            return Response({"error": "Username already exists."}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.username = new_username
        user.save()
        return Response({"message": "Username updated successfully."})

class UpdatePasswordView(BaseProfileView):
    def put(self, request):
        serializer = PasswordUpdateSerializer(data=request.data, 
                                            context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            Token.objects.filter(user=user).delete()
            new_token = Token.objects.create(user=user)
            
            return Response({
                "message": "Password updated successfully.", 
                "token": new_token.key
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfilePictureView(BaseProfileView):
    def put(self, request):
        profile = request.user.userprofile
        serializer = UserProfileSerializer(
            profile, 
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile picture updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateUserInfoView(BaseProfileView):
    def put(self, request):
        user = request.user
        data = request.data

        if self._validate_and_update_user(user, data):
            return Response({"message": "User information updated successfully."}, 
                          status=status.HTTP_200_OK)
        return Response({"error": "Invalid data provided."}, 
                       status=status.HTTP_400_BAD_REQUEST)

    def _validate_and_update_user(self, user, data):
        try:
            if username := data.get("username"):
                if User.objects.exclude(pk=user.pk).filter(username=username).exists():
                    return False
                user.username = username

            if email := data.get("email"):
                if User.objects.exclude(pk=user.pk).filter(email=email).exists():
                    return False
                user.email = email

            if name := data.get("name"):
                user.first_name = name

            user.save()
            return True
        except Exception:
            return False