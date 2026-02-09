from django.urls import path
from .views import (
    RegisterView,          # API
    LoginView,            # API
    UserDetailView,       # API
    HTMLRegisterView,     # HTML
    HTMLLoginView         # HTML
)

urlpatterns = [
    # HTML-страницы (для форм в браузере)
    path('register/', HTMLRegisterView.as_view(), name='register'),
    path('login/', HTMLLoginView.as_view(), name='login'),

    # API-эндпоинты (для JSON/JWT)
    path('api/register/', RegisterView.as_view(), name='api-register'),
    path('api/login/', LoginView.as_view(), name='api-login'),
    path('api/me/', UserDetailView.as_view(), name='user-detail'),
]