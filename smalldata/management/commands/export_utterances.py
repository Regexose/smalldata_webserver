import csv
import os
from django.core.management.base import BaseCommand
from smalldata.models import Utterance

target_dir = 'model_data/db_dumps'
header = ['Utterance', 'Category', 'Topic', 'Date', 'Time']


class Command(BaseCommand):
    help = 'Export utterances from database'

    def add_arguments(self, parser):
        parser.add_argument('filename', type=str, help='name of the target file')

    def handle(self, *args, **kwargs):
        filename = kwargs['filename']
        target = os.path.join(target_dir, filename)
        utterances = Utterance.objects.all()
        with open(target, 'w', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            for utterance in utterances:
                writer.writerow([utterance.text, utterance.category.name, utterance.topic.text,
                                 utterance.created.strftime('%d.%m.%Y'),
                                 utterance.created.strftime('%H:%M:%S'),
                                 ])
