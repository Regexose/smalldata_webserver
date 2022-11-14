import os
import json
import sys
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from decouple import config

sys.path.append(os.path.abspath(os.path.dirname(__file__) + '/../..'))  # hack top make sure webserver can be imported
sys.path.reverse()  # hack to make sure the project's config is used instead of a config from the package 'odf'
from smalldata_webserver.config import settings


# Checks whether CUDA is available and loads corresponding modules if neccessary.
def check_cuda(config):
    if "DEVICE" not in config.keys():
        return config

    if "cuda" in config["DEVICE"] and torch.cuda.is_available():
        import torch.backends.cudnn as cudnn
        cudnn.benchmark = True
        print("Using CUDA Device: " + str(config["DEVICE"]))
    else:
        print("Using CPU")
    return config


# Loads a specified json file.
def load_json(path):
    with open(os.path.abspath(path), "r", encoding="utf-8") as file:
        return json.load(file)


def get_classifier(language="de"):
    if config("APP_LANGUAGE") == 'mock':
        print("Using mock classifier")
        return DeployableMock()

    checkpoint_path = os.path.join(settings.DATA_DIR, "trained_models", language, "checkpoint")
    # Load model and tokenizer from checkpoint.
    tokenizer = AutoTokenizer.from_pretrained(checkpoint_path, local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(checkpoint_path, local_files_only=True)

    # Define the classifier used to classify the output data.
    classifier = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)

    return DeployableBert(classifier)


class DeployableMock(object):
    UNCLASSIFIABLE = 'unknown'

    def predict(self, text):
        return "praise"


class DeployableBert:
    UNCLASSIFIABLE = 'unknown'
    classes = ["lecture", "praise", "insinuation", "dissent", "concession"]

    def __init__(self, classifier):
        self.classifier = classifier

    def is_in_vocab(self, word):
        return word in self.classifier.tokenizer.vocab or word.capitalize() in self.classifier.tokenizer.vocab or \
               word.lower() in self.classifier.tokenizer.vocab

    def predict(self, text):
        prediction = self.classifier(text)
        category_id = int(prediction[0]["label"][6:])
        return self.classes[category_id]


classifier = {lang: get_classifier(lang) for lang in settings.LANGUAGES}
