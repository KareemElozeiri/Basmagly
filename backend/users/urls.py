from django.urls import path
from .views import (
    UserSignupView,
    UserLoginView,
    UpdateUsernameView,
    UpdatePasswordView,
    UpdateProfilePictureView,
    DocumentUploadView,
    DocumentListView,
    DocumentDetailView,
    DocumentDownloadView,
)

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('update-username/', UpdateUsernameView.as_view(), name='update_username'),
    path('update-password/', UpdatePasswordView.as_view(), name='update_password'),
    path('update-profile-picture/', UpdateProfilePictureView.as_view(), name='update_profile_picture'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document_upload'),
    path('documents/', DocumentListView.as_view(), name='document_list'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/download/', DocumentDownloadView.as_view(), name='document_download')
]