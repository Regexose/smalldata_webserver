from rest_framework import serializers
from .models import Utterance, Category, TrainingUtterance, SongState, Topic

from os import path
import sys
sys.path.append(path.abspath(path.dirname(__file__) + '/../..'))  # hack top make sure webserver can be imported
sys.path.reverse()  # hack to make sure the project's config is used instead of a config from the package 'odf'
from smalldata_webserver.config import settings
from classification import classifier

clf = classifier.get_classifier(settings.model_config)


def is_known_text(sentence, accept_ratio=0.5):
    """
    return True if accept_ratio of the words are known to the langauge model of the classifier
    """
    words = sentence.split(" ")
    n_known = 0.
    for word in words:
        if clf.is_in_vocab(word):
            n_known += 1

    if n_known / len(words) < accept_ratio:
        raise serializers.ValidationError("Utterance has no german words")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'german_name')


class UtteranceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(many=False, read_only=True)
    msg_id = serializers.CharField(read_only=True)
    text = serializers.CharField(validators=[is_known_text])

    class Meta:
        model = Utterance
        fields = '__all__'

    #  Overwrite `to_internal_value` and `create` to make sure `msg_id` is contained in `validated_data` but not passed
    #  to Model.create()
    def to_internal_value(self, data):
        internal_value = super(UtteranceSerializer, self).to_internal_value(data)
        msg_id_value = data.get("msg_id")
        my_non_model_field_value = msg_id_value
        internal_value.update({
            "msg_id": my_non_model_field_value
        })
        return internal_value

    def create(self, validated_data):
        validated_data.pop('msg_id', None)
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
