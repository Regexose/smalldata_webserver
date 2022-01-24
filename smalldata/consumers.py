from channels.generic.websocket import AsyncWebsocketConsumer
import json


class UtteranceConsumer(AsyncWebsocketConsumer):
    group_name = "show"

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
                "text": "Websocket connection successfull"
            })

    async def disconnect(self, close_code):
        print("disconect")

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

    async def category_counter(self, event):
        """
        message handler for messages transmitting cat_counter (called from CategoryCounterView.post)
        :param event:
        :return:
        """
        await self.send(
            text_data=json.dumps({
                "type": "category_counter",
                "body": event["text"]
            }))
