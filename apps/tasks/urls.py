from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, task_board

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')

urlpatterns = [
    path('board/', task_board, name='task-board'),
    path('', include(router.urls)),
]