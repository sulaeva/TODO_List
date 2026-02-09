from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from apps.tasks.models import Task
from apps.users.models import User


class TaskStatisticsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        total_tasks = Task.objects.filter(owner=user).count()
        status_stats = Task.objects.filter(owner=user).values('status').annotate(
            count=Count('id')
        )

        overdue_tasks = Task.objects.filter(
            owner=user,
            deadline__lt=timezone.now().date(),
            status__in=['todo', 'in_progress']
        ).count()

        recent_tasks = Task.objects.filter(
            owner=user,
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()

        return Response({
            'user_statistics': {
                'total_tasks': total_tasks,
                'status_breakdown': {item['status']: item['count'] for item in status_stats},
                'overdue_tasks': overdue_tasks,
                'recent_tasks': recent_tasks,
            }
        })