from de.sots.cellarsandcentaurs.domain.model import *
from de.sots.cellarsandcentaurs.domain.model.fightable import Fightable


class CreatureUtil:
    STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor"

    @staticmethod
    def count_treasure_hoard(creature: Creature) -> int:
        """Counts the treasure hoard a creature guards."""
        return creature.xp_value * 10

    @staticmethod
    def is_wounded(hit_points: HitPoints) -> bool:
        return hit_points.current < hit_points.max
