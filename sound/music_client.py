from pythonosc.udp_client import SimpleUDPClient
import requests
import json


def get(address, port):
    if address[0:4] == 'http':  # use http client
        client = HTTPClient(address, port)
    else:  # use OSC client
        client = SimpleUDPClient(address, port)
    return client


class MusicClient(SimpleUDPClient):
    def __init__(self, ip, port):
        super(MusicClient, self).__init__(ip, port)
        self.port = port
        self.ip = ip
        self.trig = cycle([0.0, 1.0])

    def __repr__(self):
        return '(Client Port {})'.format(self.port)


class HTTPClient:
    def __init__(self, url , port):
        #  Dont use https due to bug in urllib (https://stackoverflow.com/questions/65516325)
        if url.startswith('https'):
            url.replace('https', 'http')
            
        self.__target = url + ':' + str(port) + '{}'

    def send_message(self, route, body):
        try:
            response = requests.post(self.__target.format(route), json.dumps(body))
            print("Sending to music server status: ", response.status_code)
        except requests.exceptions.ConnectionError as e:
            print("Message not sent, ", e)


