from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DeliveryZoneViewSet


app_name = "delivery"

router = DefaultRouter()
router.register("zones", DeliveryZoneViewSet, basename="delivery-zone")

urlpatterns = [
    path("", include(router.urls)),
]
