import os


project_path = os.path.join(os.path.abspath(__file__), '../..')


def get_classifier(config_file):
    if config_file == "None":
        return DeployableMock()


class DeployableMock(object):
    UNCLASSIFIABLE = 'unknown'

    def predict(self, text):
        return "praise"