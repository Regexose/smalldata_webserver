from channels.generic.websocket import AsyncWebsocketConsumer
import json


class BaseConsumer(AsyncWebsocketConsumer):
    group_name = "NEED TO OVERWRITE"

    async def connect(self):
        print("connecting")

        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )

        await self.accept()
        #  TODO send current cat_counter after socket is connected

        await self.channel_layer.group_send(
            self.group_name, {
                "type": "confirmation",
                "text": "Websocket connection successful"
            })

    async def disconnect(self, close_code):
        print("disconected")

    async def confirmation(self, event):
        """
        message handler for confirmation messages (called in self.connect)
        :param event:
        :return:
        """
        await self.send(
            text_data=json.dumps({
                "type": "confirmation",
                "body": event["text"]
            }))
        print('In confirmation callback:', event["text"])


class BrowserConsumer(BaseConsumer):
    group_name = "browser"

    async def set_topic(self, event):
        """
        message handler for messages transmitting set_current (called from TopicView.set_current)
        :param event:
        :return:
        """
        await self.send(
            text_data=json.dumps({
                "type": "topic",
                "body": event["text"]
            }))

    async def new_utterance(self, event):
        """
        message handler for messages transmitting new utterances to Browser-Clients
         (called from UtteranceView.perform_create)
        :param event:
        :return:
        """
        await self.send(
            text_data=json.dumps({
                "type": "utterance",
                "body": event["body"]
            }))


class ProxyConsumer(BrowserConsumer):
    """
    message handler for transmitting messages to ProxyClient
    (called from UtteranceView.perform_create)
    """
    group_name = "proxy"
