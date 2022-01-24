from pythonosc.udp_client import SimpleUDPClient
from itertools import *

INTERPRETER_TARGET_ADDRESS = "/interpreter_input"
INTERPRETER_PORT = 5020


class ClientIO(SimpleUDPClient):
    def __init__(self, ip, port):
        super(ClientIO, self).__init__(ip, port)
        self.send_msg('\tClientIO Connection!! ip {}  port {}'.format(ip, port))
        print('Client Connection: {} port {}'.format(ip, port))

    def send_msg(self, msg):
        self.send_message("/message", msg)


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
