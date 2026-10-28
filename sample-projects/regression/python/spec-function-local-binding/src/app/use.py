from app.models import Model


def build(Model):
    return Model()


def rebuild():
    Model = object
    return Model()


def uses():
    return Model()
