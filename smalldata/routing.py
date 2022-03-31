from django.urls import re_path

from smalldata import consumers

websocket_urlpatterns = [
    # We use re_path() due to limitations in URLRouter.
    re_path(r"ws/utterance", consumers.UtteranceConsumer.as_asgi()),
    re_path(r"ws/topics", consumers.TopicConsumer.as_asgi()),
]
