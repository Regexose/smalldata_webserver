from pythonosc.udp_client import SimpleUDPClient
import requests


def get(address, port):
    if address[0:4] == 'http':  # use http client
        client = HTTPClient(address, port)
    else:  # use OSC client
        client = MusicClient(address, port)
    return client


class MusicClient(SimpleUDPClient):
    def __init__(self, ip, port):
        super(MusicClient, self).__init__(ip, port)
        self.port = port
        self.ip = ip
        self.trig = cycle([0.0, 1.0])

    def __repr__(self):
        return '(Client Port {})'.format(self.port)

    def msg_send(self, note, velo, trig):
        self.send_message(INTERPRETER_TARGET_ADDRESS, [note, velo, trig])


class HTTPClient:
    def __init__(self, ip, port):
        self.__target = ip + ':' + port + '{}'

    def send_message(self, route, body):
        response = requests.post(self.__target.format(route), body)
        print("Sending to music server status: ", response.status_code)

