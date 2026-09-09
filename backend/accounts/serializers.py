from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import CustomerProfile


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    preferred_language = serializers.CharField(
        source="customer_profile.preferred_language",
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "preferred_language",
        ]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    preferred_language = serializers.ChoiceField(
        choices=CustomerProfile.Language.choices,
        default=CustomerProfile.Language.FRENCH,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "preferred_language",
        ]
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
            "phone_number": {"required": False, "allow_blank": True},
        }

    def validate_email(self, value):
        return User.objects.normalize_email(value)

    def validate_phone_number(self, value):
        return value or None

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        preferred_language = validated_data.pop("preferred_language")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        CustomerProfile.objects.create(
            user=user,
            preferred_language=preferred_language,
        )
        return user


class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = User.objects.normalize_email(attrs["email"])
        password = attrs["password"]
        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        attrs["user"] = user
        return attrs
