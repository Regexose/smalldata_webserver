import os
import sys
from decouple import config
import subprocess

base_dir = os.path.dirname(__file__)
env_file = os.path.join(base_dir, 'frontend', '.env')


def create_env_file():
    hostname = config('HOSTNAME')
    port = config('PORT', '80')

    if hostname[0:5] == 'https':
        # use encrypted urls
        http_url = hostname + '/api/'
        ws_url = 'wss' + hostname[5::] + '/ws/'
    else:
        http_url = 'http://' + hostname + ':' + port + '/api/'
        ws_url = 'ws://' + hostname + ':' + port + '/ws/'

    with open(env_file, 'w') as file:
        file.writelines([
            'REACT_APP_WS_URL = ' + ws_url + '\n',
            'REACT_APP_HTTP_URL = ' + http_url + '\n'
            'REACT_APP_LANGUAGE = ' + config("LANGUAGE")
        ])


if __name__ == '__main__':
    if os.path.isfile(env_file):
        print('env-file exists, ignoring settings.ini')
    else:
        create_env_file()

    os.chdir('frontend')
    subprocess.run(['npm', 'run', 'relocate'])
    os.chdir('..')

    subprocess.run(['python', 'manage.py', 'collectstatic', '--noinput'])
