from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone #сама болавила
from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['title']
    ordering_fields = ['created_at', 'deadline']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total = self.get_queryset().count()
        status_counts = {
            status: self.get_queryset().filter(status=status).count()
            for status, _ in Task.STATUS_CHOICES
        }
        overdue = self.get_queryset().filter(
            deadline__lt=timezone.now().date(),
            status__in=['todo', 'in_progress']
        ).count()

        return Response({
            'total_tasks': total,
            'status_distribution': status_counts,
            'overdue_tasks': overdue
        })

def task_board(request):
    return render(request, 'tasks/index.html')