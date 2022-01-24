from os import sys, path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from classification.Categories import CATEGORY_NAMES

# simple notes for a simple feedback of the MusicServer
SIMPLE_NOTES = {CATEGORY_NAMES[k]: (60 + k) for k in range(len(CATEGORY_NAMES))}
SIMPLE_NOTES['Gaga'] = 126
