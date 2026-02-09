from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'deadline', 'owner', 'created_at']
    list_filter = ['status', 'deadline', 'owner']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'