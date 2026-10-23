from app.domain.creature import Creature
from app.dto.creature import Creature as CreatureDto


class Facade:
    def convert(self, creature: Creature) -> CreatureDto:
        return CreatureDto()
