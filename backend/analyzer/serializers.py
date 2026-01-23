
from rest_framework import serializers
from .models import Case, UserProfile, Document, Transaction
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'balance', 'phone_number', 'avatar', 'bio', 'preferences']
        read_only_fields = [] # Balance updated via frontend sync for now

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['user', 'uploaded_at', 'size']

    def create(self, validated_data):
        # Auto-assign user from context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'timestamp', 'type', 'amount'] # Read-only mostly, created via specific endpoints
