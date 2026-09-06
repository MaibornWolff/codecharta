from .creature import Creature
from .creature_id import CreatureId
from .creature_type import CreatureType


class Centaur(Creature):
    def __init__(self, creature_id: CreatureId):
        super().__init__(creature_id, CreatureType.MONSTROSITY)

    def attack_bonus(self) -> int:
        return super().attack_bonus() + 1
