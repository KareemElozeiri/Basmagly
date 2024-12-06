from django import forms
from django.contrib.auth.models import User
from .models import UserProfile

class UserSignupForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

class UserProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']

class UsernameUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']

class PasswordUpdateForm(forms.Form):
    old_password = forms.CharField(widget=forms.PasswordInput)
    new_password = forms.CharField(widget=forms.PasswordInput)
