from django.core.validators import MinValueValidator
from django.db import models


class DeliveryZone(models.Model):
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
    )
    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        default=0,
    )
    estimated_delivery_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "city", "area"]
        constraints = [
            models.UniqueConstraint(
                fields=["city", "area"],
                name="unique_delivery_zone_city_area",
            ),
        ]
        indexes = [
            models.Index(fields=["city", "area", "is_active"]),
        ]

    def __str__(self):
        location = f"{self.city} - {self.area}" if self.area else self.city
        return f"{location}: {self.delivery_fee} TND"