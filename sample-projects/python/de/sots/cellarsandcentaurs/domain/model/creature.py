from typing import Dict, Optional

from de.sots.cellarsandcentaurs.application import CreatureFacade
from de.sots.cellarsandcentaurs.domain.model.armor_class import ArmorClass
from de.sots.cellarsandcentaurs.domain.model.creature_id import CreatureId
from de.sots.cellarsandcentaurs.domain.model.creature_type import CreatureType
from de.sots.cellarsandcentaurs.domain.model.fightable import Fightable
from de.sots.cellarsandcentaurs.domain.model.hit_points import HitPoints
from de.sots.cellarsandcentaurs.domain.model.speed import Speed
from de.sots.cellarsandcentaurs.domain.model.speed_type import SpeedType


class Creature(Fightable):
    """A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds."""

    def __init__(self, creature_id: CreatureId, creature_type: CreatureType = CreatureFacade.STANDARD_CREATURE_TYPE,
        xp_value: int = 0,
    ):
        self.id = creature_id
        self.type = creature_type
        self.armor_class: Optional[ArmorClass] = None
        self.speeds: Dict[SpeedType, Speed] = {}
        self.hit_points: Optional[HitPoints] = None
        self.xp_value = xp_value

    def get_id(self) -> CreatureId:
        return self.id

    def get_type(self) -> CreatureType:
        return self.type

    def get_armor_class(self) -> Optional[ArmorClass]:
        return self.armor_class

    def set_armor_class(self, armor_class: ArmorClass) -> None:
        self.armor_class = armor_class

    def get_speeds(self) -> Dict[SpeedType, Speed]:
        return self.speeds

    def set_speeds(self, speeds: Dict[SpeedType, Speed]) -> None:
        self.speeds = speeds

    def get_hit_points(self) -> Optional[HitPoints]:
        return self.hit_points

    def set_hit_points(self, hit_points: HitPoints) -> None:
        self.hit_points = hit_points

    def gain_xp_value(self, xp_value: int) -> None:
        self.xp_value += xp_value

    def attack_bonus(self) -> int:
        return 2 if self.hit_points is None else self.hit_points.current // 10
