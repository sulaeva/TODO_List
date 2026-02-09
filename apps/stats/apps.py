from django.apps import AppConfig

class StatsConfig(AppConfig):  # ← имя класса должно быть StatsConfig
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.stats'        # ← путь должен быть полным