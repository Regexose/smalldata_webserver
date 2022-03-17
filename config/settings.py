from os import path
import json

#  Directories
BASE_DIR = path.dirname(path.dirname(path.abspath(__file__)))
DATA_DIR = path.join(BASE_DIR, 'model_data')

#  model file for classification
model_config = "config_live_bert.json"  # 'config_train_lstm.json'

# Song settings
song_file = "bossa_new.json"
song_path = path.join(BASE_DIR, 'config', song_file)
ips = json.load(open(path.join(BASE_DIR, 'config', 'ip_config.json')))

note_intro = 0
note_end = 12

# OSC-Settings
PERFORMER_COUNTER_ADDRESS = "/counter"
SONG_ADVANCE_ADDRESS = '/advance'
SONG_RACK_ADDRESS = '/rack'
SONG_MIDICC_ADDRESS = '/control'
SONG_SYNTH_RESET_ADDRESS = '/reset'
SONG_ARP_ADDRESS = '/arp'
SONG_BEAT_ADDRESS = '/beat'
INTERPRETER_TARGET_ADDRESS = "/interpreter_input"
SONG_SERVER_PORT = 57120
OSCULATOR_PORT = 5010
OSCULATOR_TARGET_ADDRESS = "/osculator_input"
DISPLAY_UTTERANCE_ADDRESS = "/display_input"
DISPLAY_PARTINFO_ADDRESS = "/display_partinfo"
DISPLAY_INIT_ADDRESS = "/display_init"
DISPLAY_ARTICLE_ADDRESS = "/article"
DISPLAY_PORT = 5030
AUDIENCE_PORT = 5040
PERFORMER_PORT = 5050
FRONTEND_PORT = 3000


# MIDI-note-to-beat-counter-conversion (for Ableton)
note_to_beat = {
    120: '1',
    121: '2',
    122: '3',
    123: '4',
    124: '5',
    125: '6',
    126: '7',
    127: '8',
    'first_count_in_bar': '1'
}

