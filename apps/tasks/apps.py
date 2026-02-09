from django.apps import AppConfig

class TasksConfig(AppConfig):  # ← имя класса должно быть TasksConfig
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tasks'        # ← путь должен быть полным