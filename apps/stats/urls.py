from django.urls import path
from .views import TaskStatisticsView

urlpatterns = [
    path('tasks/', TaskStatisticsView.as_view(), name='task-statistics'),
]