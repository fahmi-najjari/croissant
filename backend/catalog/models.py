from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    name_fr = models.CharField(max_length=120)
    name_ar = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description_fr = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name_fr"]
        verbose_name = _("category")
        verbose_name_plural = _("categories")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_fr)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name_fr


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    name_fr = models.CharField(max_length=160)
    name_ar = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    description_fr = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
    )
    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        validators=[MinValueValidator(0)],
        blank=True,
        null=True,
    )
    sku = models.CharField(max_length=80, unique=True, blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    preparation_time_minutes = models.PositiveIntegerField(default=0)
    track_stock = models.BooleanField(default=False)
    stock_quantity = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name_fr"]
        indexes = [
            models.Index(fields=["is_available", "is_featured"]),
            models.Index(fields=["category", "is_available"]),
        ]

    @property
    def current_price(self):
        return self.discount_price if self.discount_price is not None else self.price

    @property
    def in_stock(self):
        return not self.track_stock or self.stock_quantity > 0

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_fr)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name_fr


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/")
    alt_text_fr = models.CharField(max_length=160, blank=True)
    alt_text_ar = models.CharField(max_length=160, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["product"],
                condition=models.Q(is_primary=True),
                name="unique_primary_image_per_product",
            ),
        ]

    def __str__(self):
        return f"Image for {self.product.name_fr}"