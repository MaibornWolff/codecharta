from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from ..model import creature
from .creatures import Creatures

if TYPE_CHECKING:
    from ..model.creature_id import CreatureId

logger = logging.getLogger(__name__)


class CreatureService:
    def __init__(self, creatures: Creatures):
        self.creatures = creatures

    def save(self, creature_to_save: creature.Creature) -> None:
        logger.info("saving creature")
        self.creatures.save(creature_to_save)

    def find(self, creature_id: CreatureId) -> creature.Creature:
        return self.creatures.find(creature_id)
