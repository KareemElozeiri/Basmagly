import os
from .settings import *
from .settings import BASE_DIR


MEDIA_ROOT = BASE_DIR/'media'
STATIC_ROOT = BASE_DIR/'static_files'
ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']]
CSRF_TRUSTED_ORIGINS = ['https://'+os.environ['WEBSITE_HOSTNAME']]
DEBUG = False

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.WhiteNoiseMiddleware'
]

CONNECTION = os.environ["AZURE_POSTRESQL_CONNECTIONSTRING"]
CONNECTION_STR = {
    pair.split('=')[0]:pair.split('=')[1] for pair in   CONNECTION.split(' ')
}

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

DATABASES = {
   'default': {
       'ENGINE': 'django.db.backends.postgresql',
       'NAME': CONNECTION_STR['dbname'],
        'HOST': CONNECTION_STR['host'],
       'USER': CONNECTION_STR['user'],
       'PASSWORD': CONNECTION_STR['password '],
   }
}
