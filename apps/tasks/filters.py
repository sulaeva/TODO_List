import django_filters
from .models import Task



class TaskFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Task.STATUS_CHOICES)
    deadline = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')

    class Meta:
        model = Task
        fields = ['status', 'deadline']