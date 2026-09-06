from .creature_id import CreatureId


class NoSuchCreatureException(Exception):
    def __init__(self, creature_id: CreatureId):
        super().__init__("No such creature in the dungeon: " + creature_id.id)
        self.creature_id = creature_id
