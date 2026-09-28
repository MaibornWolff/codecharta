from .creature_entity import CreatureEntity as Entity
from .repository import Repository


class CreatureRepository(Repository[Entity]):
    def key_of(self, item: Entity) -> str:
        return item.get_id()
