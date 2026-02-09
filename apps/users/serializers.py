from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150,
        help_text="Имя пользователя"
    )
    email = serializers.EmailField(
        help_text="Email пользователя"
    )
    password = serializers.CharField(
        min_length=8,
        write_only=True,
        help_text="Пароль (минимум 8 символов)"
    )
    password_confirm = serializers.CharField(
        min_length=8,
        write_only=True,
        help_text="Подтверждение пароля"
    )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        help_text="Имя пользователя"
    )
    password = serializers.CharField(
        write_only=True,
        help_text="Пароль"
    )

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Неверные учетные данные')

        # Возвращаем данные, а не объект пользователя
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['date_joined']