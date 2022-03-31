import os
import json


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


# Retrieves a config given a path.
def get_config(path=None):
    if path is None:
        parser = argparse.ArgumentParser()
        parser.add_argument("--config", default="")
        args = parser.parse_args()
        if args.config is None:
            raise Exception("--config not defined")
        config = load_json(args.config)
    else:
        config = load_json(path)
    config = check_cuda(config)
    return config