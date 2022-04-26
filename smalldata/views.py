import pickle
from collections import Counter

from django.http import JsonResponse
from django.shortcuts import render

from rest_framework import viewsets, response, status
from rest_framework.decorators import api_view, action
from .serializers import UtteranceSerializer, CategorySerializer, TrainingUtteranceSerializer, SongStateSerializer, \
    TopicSerializer
from .models import Utterance, Category, TrainingUtterance, SongState, Topic
from .consumers import UtteranceConsumer, TopicConsumer

from channels.layers import get_channel_layer
from os import path
import sys
from asgiref.sync import async_to_sync

from sound.UDPClient import MusicClient

sys.path.append(path.abspath(path.dirname(__file__) + '/../..'))  # hack top make sure webserver can be imported
sys.path.reverse()  # hack to make sure the project's config is used instead of a config from the package 'odf'
# parent_path = path.join(path.abspath(path.dirname(__file__) + '/../..'))
# sys.path.append(parent_path)  # hack top make sure webserver can be imported

from smalldata_webserver.config import settings
from classification import classifier

clf = classifier.get_classifier(settings.model_config)
#   Client for a simple Feedback from Ableton Live
song_client = MusicClient(settings.ips['song_server'], settings.SONG_SERVER_PORT)
display_client = MusicClient(settings.ips['audience'], settings.AUDIENCE_PORT)
category_counter = Counter({"concession": 0, "praise":0, "dissent": 0, "lecture":0, "insinuation":0})

def send_to_music_server(utterance, category):
    osc_dict = {
        'text': utterance,
        'cat': category,
    }
    category_counter.update({category: 1})
    print(category_counter)
    # osc_map = pickle.dumps(osc_dict)
    song_client.send_message(settings.INTERPRETER_TARGET_ADDRESS, [category, category_counter[category]])
    # display_client.send_message(settings.DISPLAY_UTTERANCE_ADDRESS, [utterance, category])


class UtteranceView(viewsets.ModelViewSet):
    serializer_class = UtteranceSerializer
    queryset = Utterance.objects.all()

    def perform_create(self, serializer):
        # Fetch sent data
        text = serializer.validated_data["text"]
        # send text to clf to return a category
        cat = clf.predict(text)

        # lookup found category in database
        #  TODO: build a test during startup to make sure the db and the model reproduce the same categories!
        categories = Category.objects.all().filter(name=str(cat))
        if not categories:
            print('WARNING: category {} not in db! Fix your db setup!'.format(cat))
        category = categories[0]
        #  save result in db
        serializer.validated_data["category"] = category

        topics = Topic.objects.all().filter(is_current=1)
        serializer.validated_data["topic"] = topics[0]

        super(UtteranceView, self).perform_create(serializer)
        print('cat: {}\ntext {}'.format(category.name, text))

        #  send to relevant other services
        if cat[0] != clf.UNCLASSIFIABLE:
            send_to_music_server(text.encode("utf-8"), category.name)

            # to websocket
            channel_layer = get_channel_layer()
            data = serializer.data
            data["msgId"] = serializer.validated_data["msg_id"]
            async_to_sync(channel_layer.group_send)(
                TopicConsumer.group_name, {
                    "type": "new_utterance",
                    "body": data
                }
            )


class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class TrainingUtteranceView(viewsets.ModelViewSet):
    serializer_class = TrainingUtteranceSerializer
    queryset = TrainingUtterance.objects.all()


class TopicView(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    queryset = Topic.objects.all()

    @action(methods=['post'], detail=True)
    def set_current(self, request, pk=None):
        Topic.objects.filter(is_current=True).update(is_current=False)
        current_topic = Topic.objects.filter(pk=pk)
        current_topic.update(is_current=True)

        # inform connected channels
        serializer = TopicSerializer(current_topic.get())
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            TopicConsumer.group_name, {
                "type": "set_current",
                "text": serializer.data
            }
        )

        return response.Response("ok")

    @action(methods=['get'], detail=False)
    def get_current(self, request):
        topic = self.get_queryset().get(**{'is_current': True})
        serializer = TopicSerializer(topic)
        return response.Response(serializer.data)


@api_view(['GET', 'POST'])
def song_state(request):
    if request.method == 'POST':
        serializer = SongStateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            #  inform connected channels
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                UtteranceConsumer.group_name, {
                    "type": "category_counter",
                    "text": request.data['state']
                }
            )
            return response.Response(serializer.data, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        prev = SongState.objects.last()
        return response.Response(prev.state)


def trigger_category(request, pk):
    if request.method == 'POST':
        category = Category.objects.get(pk=pk)
        text = 'test text, um eine Kategorie zu starten!'
        send_to_music_server(text, category.name)

        return JsonResponse(data={'status': 'true', 'message': 'ok'})


def render_react(request):
    return render(request, "index.html")
