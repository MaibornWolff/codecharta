from app.lib import register


@register
def handle():
    return None


def register(function):
    return function
