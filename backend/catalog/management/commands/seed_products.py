from decimal import Decimal

from django.core.management.base import BaseCommand

from catalog.models import Category, Product
from delivery.models import DeliveryZone


class Command(BaseCommand):
    help = "Seed sample bakery categories, products, and delivery zones."

    def handle(self, *args, **options):
        categories = [
            {
                "slug": "viennoiseries",
                "name_fr": "Viennoiseries",
                "name_ar": "\u0627\u0644\u0645\u062e\u0628\u0648\u0632\u0627\u062a \u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629",
                "description_fr": "Croissants, pains au chocolat et pieces feuilletees.",
                "description_ar": "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0648\u0645\u062e\u0628\u0648\u0632\u0627\u062a \u0641\u0631\u0646\u0633\u064a\u0629 \u0637\u0627\u0632\u062c\u0629.",
                "sort_order": 10,
            },
            {
                "slug": "pains",
                "name_fr": "Pains",
                "name_ar": "\u0627\u0644\u062e\u0628\u0632",
                "description_fr": "Pains du jour pour la table et les sandwichs.",
                "description_ar": "\u062e\u0628\u0632 \u064a\u0648\u0645\u064a \u0637\u0627\u0632\u062c \u0644\u0644\u0645\u0627\u0626\u062f\u0629 \u0648\u0627\u0644\u0633\u0646\u062f\u0648\u064a\u062a\u0634\u0627\u062a.",
                "sort_order": 20,
            },
            {
                "slug": "patisseries",
                "name_fr": "Patisseries",
                "name_ar": "\u0627\u0644\u062d\u0644\u0648\u064a\u0627\u062a",
                "description_fr": "Douceurs individuelles et desserts a partager.",
                "description_ar": "\u062d\u0644\u0648\u064a\u0627\u062a \u0641\u0631\u062f\u064a\u0629 \u0648\u0642\u0637\u0639 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629.",
                "sort_order": 30,
            },
        ]

        category_by_slug = {}
        for category_data in categories:
            slug = category_data.pop("slug")
            category, _ = Category.objects.update_or_create(
                slug=slug,
                defaults={**category_data, "is_active": True},
            )
            category_by_slug[slug] = category

        products = [
            {
                "slug": "croissant-beurre",
                "category": category_by_slug["viennoiseries"],
                "name_fr": "Croissant au beurre",
                "name_ar": "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0628\u0627\u0644\u0632\u0628\u062f\u0629",
                "description_fr": "Feuilletage pur beurre, dore et croustillant.",
                "description_ar": "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0628\u0627\u0644\u0632\u0628\u062f\u0629 \u0628\u0637\u0628\u0642\u0627\u062a \u0645\u0642\u0631\u0645\u0634\u0629.",
                "price": Decimal("2.500"),
                "discount_price": None,
                "sku": "SEED-CROISSANT-BEURRE",
                "is_featured": True,
                "preparation_time_minutes": 15,
                "track_stock": True,
                "stock_quantity": 40,
                "sort_order": 10,
            },
            {
                "slug": "pain-chocolat",
                "category": category_by_slug["viennoiseries"],
                "name_fr": "Pain au chocolat",
                "name_ar": "\u062e\u0628\u0632 \u0628\u0627\u0644\u0634\u0648\u0643\u0648\u0644\u0627\u062a\u0629",
                "description_fr": "Deux barres de chocolat dans une pate feuilletee.",
                "description_ar": "\u0639\u062c\u064a\u0646 \u0645\u0648\u0631\u0642 \u0645\u062d\u0634\u0648 \u0628\u0627\u0644\u0634\u0648\u0643\u0648\u0644\u0627\u062a\u0629.",
                "price": Decimal("3.000"),
                "discount_price": Decimal("2.700"),
                "sku": "SEED-PAIN-CHOCOLAT",
                "is_featured": True,
                "preparation_time_minutes": 15,
                "track_stock": True,
                "stock_quantity": 32,
                "sort_order": 20,
            },
            {
                "slug": "baguette-tradition",
                "category": category_by_slug["pains"],
                "name_fr": "Baguette tradition",
                "name_ar": "\u0628\u0627\u063a\u064a\u062a \u062a\u0642\u0644\u064a\u062f\u064a",
                "description_fr": "Croute fine, mie legere, cuisson du matin.",
                "description_ar": "\u0628\u0627\u063a\u064a\u062a \u0628\u0642\u0634\u0631\u0629 \u0631\u0642\u064a\u0642\u0629 \u0648\u0644\u0628 \u062e\u0641\u064a\u0641.",
                "price": Decimal("1.200"),
                "discount_price": None,
                "sku": "SEED-BAGUETTE-TRAD",
                "is_featured": False,
                "preparation_time_minutes": 10,
                "track_stock": True,
                "stock_quantity": 60,
                "sort_order": 30,
            },
            {
                "slug": "pain-complet",
                "category": category_by_slug["pains"],
                "name_fr": "Pain complet",
                "name_ar": "\u062e\u0628\u0632 \u0642\u0645\u062d \u0643\u0627\u0645\u0644",
                "description_fr": "Pain complet dense et parfume aux graines.",
                "description_ar": "\u062e\u0628\u0632 \u0642\u0645\u062d \u0643\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0628\u0630\u0648\u0631.",
                "price": Decimal("2.800"),
                "discount_price": None,
                "sku": "SEED-PAIN-COMPLET",
                "is_featured": False,
                "preparation_time_minutes": 20,
                "track_stock": True,
                "stock_quantity": 25,
                "sort_order": 40,
            },
            {
                "slug": "tartelette-citron",
                "category": category_by_slug["patisseries"],
                "name_fr": "Tartelette citron",
                "name_ar": "\u062a\u0627\u0631\u062a \u0627\u0644\u0644\u064a\u0645\u0648\u0646",
                "description_fr": "Creme citron acidulee et pate sablee.",
                "description_ar": "\u0643\u0631\u064a\u0645\u0629 \u0644\u064a\u0645\u0648\u0646 \u0645\u0646\u0639\u0634\u0629 \u0639\u0644\u0649 \u0639\u062c\u064a\u0646 \u0647\u0634.",
                "price": Decimal("4.500"),
                "discount_price": None,
                "sku": "SEED-TARTELETTE-CITRON",
                "is_featured": True,
                "preparation_time_minutes": 25,
                "track_stock": True,
                "stock_quantity": 18,
                "sort_order": 50,
            },
            {
                "slug": "eclair-chocolat",
                "category": category_by_slug["patisseries"],
                "name_fr": "Eclair chocolat",
                "name_ar": "\u0627\u0643\u0644\u064a\u0631 \u0628\u0627\u0644\u0634\u0648\u0643\u0648\u0644\u0627\u062a\u0629",
                "description_fr": "Pate a choux, creme chocolat et glacage noir.",
                "description_ar": "\u0627\u0643\u0644\u064a\u0631 \u0628\u0643\u0631\u064a\u0645\u0629 \u0648\u0634\u0648\u0643\u0648\u0644\u0627\u062a\u0629 \u063a\u0646\u064a\u0629.",
                "price": Decimal("4.000"),
                "discount_price": Decimal("3.500"),
                "sku": "SEED-ECLAIR-CHOCOLAT",
                "is_featured": True,
                "preparation_time_minutes": 25,
                "track_stock": True,
                "stock_quantity": 20,
                "sort_order": 60,
            },
        ]

        for product_data in products:
            slug = product_data.pop("slug")
            Product.objects.update_or_create(
                slug=slug,
                defaults={**product_data, "is_available": True},
            )

        DeliveryZone.objects.update_or_create(
            city="Tunis",
            area="Centre Ville",
            defaults={
                "delivery_fee": Decimal("5.000"),
                "minimum_order_amount": Decimal("10.000"),
                "estimated_delivery_minutes": 45,
                "is_active": True,
                "sort_order": 10,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded 3 categories, 6 products, and 1 delivery zone.",
            ),
        )
