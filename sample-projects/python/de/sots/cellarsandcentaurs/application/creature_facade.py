import logging
import uuid

import de.sots.cellarsandcentaurs.domain.model.speed
from de.sots.cellarsandcentaurs.application.dto.creature import Creature as CreatureDto
from de.sots.cellarsandcentaurs.application.tracing import traced
from de.sots.cellarsandcentaurs.domain.model.armor_class import ArmorClass
from de.sots.cellarsandcentaurs.domain.model.creature import Creature
from de.sots.cellarsandcentaurs.domain.model.creature_id import CreatureId
from de.sots.cellarsandcentaurs.domain.model.creature_type import CreatureType
from de.sots.cellarsandcentaurs.domain.model.hit_points import HitPoints
from de.sots.cellarsandcentaurs.domain.model.speed_type import SpeedType
from de.sots.cellarsandcentaurs.domain.service.creature_service import CreatureService

logger = logging.getLogger(__name__)


class CreatureFacade:
    STANDARD_CREATURE_TYPE = CreatureType.MONSTROSITY
    STABLE_NAME = "centaur-stable"

    def __init__(self, creature_service: CreatureService):
        self.creature_service = creature_service

    @traced
    def create(
        self,
        creature_type: CreatureType,
        walking_speed: int,
        fly_speed: int,
        swim_speed: int,
        burrow_speed: int,
        climb_speed: int,
        armor_class: ArmorClass,
        hit_points_value: int,
    ) -> CreatureDto:
        # Rolls initiative for every creature in the dungeon before the encounter starts.
        creature = Creature(CreatureId(str(uuid.uuid4())), creature_type)
        creature.set_armor_class(armor_class)
        creature.set_hit_points(HitPoints.init(hit_points_value))
        creature.set_speeds(
            {
                SpeedType.WALKING: de.sots.cellarsandcentaurs.domain.model.speed.Speed(walking_speed),
                SpeedType.FLYING: de.sots.cellarsandcentaurs.domain.model.speed.Speed(fly_speed),
                SpeedType.SWIMMING: de.sots.cellarsandcentaurs.domain.model.speed.Speed(swim_speed),
                SpeedType.BURROWING: de.sots.cellarsandcentaurs.domain.model.speed.Speed(burrow_speed),
                SpeedType.CLIMBING: de.sots.cellarsandcentaurs.domain.model.speed.Speed(climb_speed),
            }
        )
        self.creature_service.save(creature)
        logger.info("stabled %s in %s", creature.get_id().id, self.STABLE_NAME)
        return CreatureDto(creature.get_id().id, creature.get_type().value, hit_points_value)
