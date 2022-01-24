from rest_framework import serializers
from .models import Utterance, Category, TrainingUtterance, SongState


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class UtteranceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=False, read_only=True)

    class Meta:
        model = Utterance
        fields = '__all__'


class SongStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongState
        fields = '__all__'


class TrainingUtteranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingUtterance
        fields = '__all__'
