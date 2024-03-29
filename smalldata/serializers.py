from rest_framework import serializers
from .models import Utterance, Category, TrainingUtterance, SongState, Topic
from .classifier import classifier as clf


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'german_name')


class UtteranceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=False, read_only=True)
    msg_id = serializers.CharField(read_only=True, default="")
    path_to_file = serializers.CharField(read_only=True)
    text = serializers.CharField()
    language = serializers.CharField()

    def validate_text(self, text: str, accept_ratio=0.5) -> str:
        """
        return True if accept_ratio of the words are known to the langauge model of the classifier
        """
        words = text.split(" ")
        n_known = 0.
        for word in words:
            if clf[self.initial_data["language"]].is_in_vocab(word):
                n_known += 1

        if n_known / len(words) < accept_ratio:
            raise serializers.ValidationError(
                "Utterance has not enough words in language `{}`".format(self.initial_data["language"]))

        return text

    class Meta:
        model = Utterance
        fields = '__all__'

    #  Overwrite `to_internal_value` and `create` to make sure `msg_id` is contained in `validated_data` but not passed
    #  to Model.create()
    def to_internal_value(self, data):
        internal_value = super(UtteranceSerializer, self).to_internal_value(data)
        internal_value.update({
            "msg_id": data.get("msg_id"),
            "path_to_file": data.get("path_to_file")
        })
        return internal_value

    def create(self, validated_data):
        validated_data.pop('msg_id', None)
        validated_data.pop('path_to_file', None)
        return super().create(validated_data)


class SongStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongState
        fields = '__all__'


class TrainingUtteranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingUtterance
        fields = '__all__'


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'
