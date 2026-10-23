from app.config import Config


def start():
    return Config.load()
