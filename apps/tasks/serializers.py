from rest_framework import serializers
from .models import Task
from django.utils import timezone


class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'deadline', 'owner', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def validate_deadline(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Deadline не может быть прошлым')
        return value

    def validate_description(self, value):
        if len(value) < 10:
            raise serializers.ValidationError('Description must be at least 10 characters')
        return value