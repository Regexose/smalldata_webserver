import csv
import os
from django.core.management.base import BaseCommand
from smalldata.models import Utterance
from datetime import datetime
import argparse
import pytz

target_dir = 'model_data/db_dumps'
header = ['Utterance', 'Category', 'Topic', 'Date', 'Time']
dateformat = "%d.%m.%y-%H:%M"


def valid_date(s):
    try:
        return pytz.UTC.localize(datetime.strptime(s, dateformat))
    except ValueError:
        msg = "not a valid date: {0!r}".format(s)
        raise argparse.ArgumentTypeError(msg)


class Command(BaseCommand):
    help = 'Export utterances from database'

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, help='name of the target file')
        parser.add_argument('from', type=valid_date, help='Start time (DD.MM.YY-HH:SS, i.e. "23.07.23-08:23")')
        parser.add_argument('to', type=valid_date, help='End time (DD.MM.YY-HH:SS, i.e. "23.07.23-08:23")')

    def handle(self, *args, **kwargs):
        filename = kwargs['filename']
        start_from = kwargs['from']
        to =  kwargs['to']
        target = os.path.join(target_dir, filename)
        utterances = Utterance.objects.filter(created__range=(start_from, to))
        with open(target, 'w', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            for utterance in utterances:
                writer.writerow([utterance.text, utterance.category.name, utterance.topic.text,
                                 utterance.created.strftime('%d.%m.%Y'),
                                 utterance.created.strftime('%H:%M:%S'),
                                 ])
