import sys
from os import path

# Add root directory of `project2` to path
parent_path = path.join(path.abspath(path.dirname(__file__) + '/../..'))
sys.path.append(parent_path)  # hack top make sure webserver can be imported

from project2.src import helpers, models, deploy


def load_model(model_config):
    config_path = path.join(parent_path, "project2", "res", model_config)
    config = helpers.get_config(config_path)
    print(config_path)
    embeddings_path = path.join(parent_path, "project2", config["EMBEDDINGS PATH"])
    embeddings = helpers.load_json(embeddings_path)
    model = models.get_model(config)

    clf = deploy.DeployableModel(embeddings=embeddings, model=model)
    return clf
