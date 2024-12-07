from django.contrib import admin
from .models import UserProfile, Document

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Document)
