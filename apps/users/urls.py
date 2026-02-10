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
    # path('register/', HTMLRegisterView.as_view(), name='register'),
    # path('login/', HTMLLoginView.as_view(), name='login'),

    # API-эндпоинты (для JSON/JWT)
    path('register/', RegisterView.as_view(), name='api-register'),
    path('login/', LoginView.as_view(), name='api-login'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
]