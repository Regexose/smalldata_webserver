import os
from . import utils
from transformers import pipeline, AutoTokenizer, DataCollatorWithPadding, AutoModelForSequenceClassification


project_path = os.path.join(os.path.abspath(__file__), '../..')


def get_classifier(config_file):
    config = utils.get_config(os.path.join(project_path, "model_data", config_file))
    if config_file == 'config_live_bert.json':
        # Create tokenizer and data collator.
        tokenizer = AutoTokenizer.from_pretrained("bert-base-german-cased")
        data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

        # Load model from checkpoint.
        checkpoint_path = os.path.abspath(
            os.path.join(project_path, "model_data", config["CHECKPOINT PATH"])
        )
        model = AutoModelForSequenceClassification.from_pretrained(checkpoint_path, local_files_only=True)

        # Define the classifier used to classify the output data.
        classifier = pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)
        # Define mapping for used classes.
        mapping = {i: config["CLASSES"][i] for i in range(len(config["CLASSES"]))}

        return DeployableBert(classifier, mapping)
    else:
        print("Unknown config `{}`, using Mock".format(config_file))
        return DeployableMock()


class DeployableMock(object):
    UNCLASSIFIABLE = 'unknown'

    def predict(self, text):
        return "praise"


class DeployableBert:
    UNCLASSIFIABLE = 'unknown'

    def __init__(self, classifier, mapping):
        self.classifier = classifier
        self.mapping = mapping

    def predict(self, text):
        prediction = self.classifier(text)
        category_id = int(prediction[0]["label"][6:])
        return self.mapping[category_id]