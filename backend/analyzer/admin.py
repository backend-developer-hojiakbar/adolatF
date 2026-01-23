from django.contrib import admin
from .models import UserProfile, Case, Document, Transaction

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'balance', 'id')
    search_fields = ('user__username', 'phone_number')
    list_filter = ('user__is_active',)

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'court_type', 'court_stage', 'created_at')
    search_fields = ('title', 'user__username', 'client_name')
    list_filter = ('court_type', 'court_stage', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'type', 'size', 'uploaded_at')
    search_fields = ('name', 'user__username')
    list_filter = ('type', 'uploaded_at')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'amount', 'description', 'timestamp')
    search_fields = ('user__username', 'description')
    list_filter = ('type', 'timestamp')
