import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from catalog.models import Product
from delivery.models import DeliveryZone


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        OUT_FOR_DELIVERY = "out_for_delivery", "Out for delivery"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentMethod(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash on delivery"
        KONNECT = "konnect", "Konnect"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Unpaid"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
        blank=True,
        null=True,
    )
    delivery_zone = models.ForeignKey(
        DeliveryZone,
        on_delete=models.PROTECT,
        related_name="orders",
        blank=True,
        null=True,
    )
    order_number = models.CharField(max_length=30, unique=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH_ON_DELIVERY,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
    )
    customer_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    delivery_address = models.TextField()
    building_details = models.CharField(max_length=255, blank=True)
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        default=0,
    )
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        default=0,
    )
    discount_total = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        default=0,
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        default=0,
    )
    customer_note = models.TextField(blank=True)
    admin_note = models.TextField(blank=True)
    preferred_delivery_date = models.DateField(blank=True, null=True)
    preferred_delivery_time = models.TimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["phone_number", "created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    def generate_order_number(self):
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        token = uuid.uuid4().hex[:6].upper()
        return f"ORD-{timestamp}-{token}"

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    product_name_fr = models.CharField(max_length=160, blank=True)
    product_name_ar = models.CharField(max_length=160, blank=True)
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        ordering = ["id"]

    def save(self, *args, **kwargs):
        self.product_name_fr = self.product_name_fr or self.product.name_fr
        self.product_name_ar = self.product_name_ar or self.product.name_ar
        if self.unit_price is None:
            self.unit_price = self.product.current_price
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product_name_fr}"


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash on delivery"
        KONNECT = "konnect", "Konnect"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        CANCELLED = "cancelled", "Cancelled"

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )
    method = models.CharField(
        max_length=30,
        choices=Method.choices,
        default=Method.CASH_ON_DELIVERY,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
    )
    gateway_payment_ref = models.CharField(max_length=120, unique=True, blank=True, null=True)
    gateway_payment_url = models.URLField(blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"
