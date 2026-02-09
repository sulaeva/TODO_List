from django.db import models
from django.core.validators import MinLengthValidator
from django.utils import timezone
from apps.users.models import User
from django.core.exceptions import ValidationError


class Task(models.Model):
    STATUS_CHOICES = [  # ← перемести сюда
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(
        validators=[MinLengthValidator(10)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo'
    )
    deadline = models.DateField()
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return self.title

    def clean(self):
        if self.deadline and self.deadline < timezone.now().date():
            raise ValidationError('Deadline cannot be in the past')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)