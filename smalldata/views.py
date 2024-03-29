from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from collections import Counter

from django.http import JsonResponse
from django.shortcuts import render

from rest_framework import viewsets, response, status
from rest_framework.decorators import api_view, action
from .serializers import UtteranceSerializer, CategorySerializer, TrainingUtteranceSerializer, SongStateSerializer, \
    TopicSerializer
from .models import Utterance, Category, TrainingUtterance, SongState, Topic
from .consumers import BrowserConsumer, ProxyConsumer
from .classifier import classifier as clf


category_counter = Counter({"concession": 0, "praise": 0, "dissent": 0, "lecture": 0, "insinuation": 0})


class UtteranceView(viewsets.ModelViewSet):
    serializer_class = UtteranceSerializer
    queryset = Utterance.objects.all()

    def perform_create(self, serializer):
        # Fetch sent data
        text = serializer.validated_data["text"]
        language = serializer.validated_data["language"]
        # send text to clf to return a category
        cat = clf[language].predict(text)

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
        print('cat: {}\ntext {}'.format(category.german_name, text))

        #  send to relevant other services
        if cat[0] != clf[language].UNCLASSIFIABLE:
            # to websocket
            channel_layer = get_channel_layer()
            data = serializer.data
            data["msgId"] = serializer.validated_data["msg_id"]
            async_to_sync(channel_layer.group_send)(
                BrowserConsumer.group_name, {
                    "type": "new_utterance",
                    "body": data
                }
            )
            data["path_to_file"] = serializer.validated_data["path_to_file"]
            async_to_sync(channel_layer.group_send)(
                ProxyConsumer.group_name, {
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
            BrowserConsumer.group_name, {
                "type": "set_topic",
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
                BrowserConsumer.group_name, {
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

        return JsonResponse(data={'status': 'true', 'message': 'ok'})


def render_react(request):
    return render(request, "index.html")
