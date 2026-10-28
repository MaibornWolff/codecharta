class Node:
    pass


from app.other import Node  # noqa: E402


def grow():
    return Node()
