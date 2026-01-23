
from django.contrib import admin
from django.contrib import admin
from django.urls import path, include
from analyzer.views import PDFAnalyzeView, CaseViewSet, DocumentViewSet, UserProfileView, TransactionViewSet


from rest_framework.routers import DefaultRouter
from analyzer.views import CaseViewSet, DocumentViewSet, UserProfileView, TransactionViewSet

router = DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'transactions', TransactionViewSet, basename='transaction')

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/analyze-pdf/', PDFAnalyzeView.as_view(), name='analyze-pdf'),
    path('api/auth/', include('users.urls')),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

