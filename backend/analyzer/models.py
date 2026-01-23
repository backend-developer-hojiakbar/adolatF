
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=150000.00)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    preferences = models.JSONField(default=dict, blank=True) # theme, language

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='documents/')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, blank=True) # pdf, image, etc.
    size = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Case(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases')
    title = models.CharField(max_length=255)
    case_details = models.TextField(blank=True, null=True)
    court_type = models.CharField(max_length=100)
    court_stage = models.CharField(max_length=100)
    client_name = models.CharField(max_length=255)
    client_role = models.CharField(max_length=100)
    
    # JSON structure for complex nested data from frontend
    participants = models.JSONField(default=list)
    result = models.JSONField(default=dict, blank=True) # Analysis/DebateResult
    tasks = models.JSONField(default=list, blank=True)
    timeline = models.JSONField(default=list, blank=True)
    evidence = models.JSONField(default=list, blank=True)
    billing = models.JSONField(default=list, blank=True)
    notes = models.JSONField(default=list, blank=True)
    
    # Linking documents
    documents = models.ManyToManyField(Document, related_name='cases', blank=True)
    
    # Metadata
    folder = models.CharField(max_length=100, null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('CREDIT', 'Kirim (In)'),
        ('DEBIT', 'Chiqim (Out)'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type}: {self.amount} - {self.description}"
