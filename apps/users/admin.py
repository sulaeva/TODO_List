from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'date_joined', 'is_active']
    list_filter = ['is_active', 'date_joined']
    search_fields = ['username', 'email']
    ordering = ['-date_joined']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительная информация', {'fields': ()}),
    )