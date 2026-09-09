from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    use_in_migrations = True
    

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The email address must be set.")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(
            email=email,
            password=password,
            **extra_fields,
        )

class User(AbstractUser):
    username = None

    email = models.EmailField(_("email address"), unique=True)
    phone_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email


class CustomerProfile(models.Model):
    class Language(models.TextChoices):
        FRENCH = "fr", _("French")
        ARABIC = "ar", _("Arabic")

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )
    preferred_language = models.CharField(
        max_length=2,
        choices=Language.choices,
        default=Language.FRENCH,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer profile: {self.user.email}"


class Address(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    label = models.CharField(max_length=50, blank=True)
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    street_address = models.TextField()
    building_details = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        label = self.label or self.city
        return f"{self.full_name} - {label}"