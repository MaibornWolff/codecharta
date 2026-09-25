from abc import ABC, abstractmethod

from ..model.creature import Creature
from ..model.creature_id import CreatureId


class Creatures(ABC):
    @abstractmethod
    def save(self, creature: Creature) -> None:
        raise NotImplementedError

    @abstractmethod
    def find(self, creature_id: CreatureId) -> Creature:
        raise NotImplementedError
