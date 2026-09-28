from de.sots.cellarsandcentaurs.application import CreatureFacade
from de.sots.cellarsandcentaurs.domain.model.creature import Creature
from de.sots.cellarsandcentaurs.domain.model.creature_id import CreatureId
from de.sots.cellarsandcentaurs.domain.model.errors import NoSuchCreatureException
from de.sots.cellarsandcentaurs.domain.service.creatures import Creatures

from .creature_entity import CreatureEntity
from .creature_repository import CreatureRepository


class PersistedCreatures(Creatures):
    def __init__(self, repository: CreatureRepository):
        self.repository = repository

    def save(self, creature: Creature) -> None:
        self.repository.save(CreatureEntity(creature.get_id().id))

    def find(self, creature_id: CreatureId) -> Creature:
        entity = self.repository.find_one(creature_id.id)
        if entity is None:
            raise NoSuchCreatureException(creature_id)
        return Creature(CreatureId(entity.get_id()), CreatureFacade.STANDARD_CREATURE_TYPE)
