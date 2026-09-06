import uuid


class CreatureEntity:
    def __init__(self, id: str = None):
        self.id = id if id is not None else str(uuid.uuid4())

    def get_id(self) -> str:
        return self.id
