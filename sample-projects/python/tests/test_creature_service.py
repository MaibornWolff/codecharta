from unittest.mock import Mock

import pytest

from de.sots.cellarsandcentaurs.domain.model.creature import Creature
from de.sots.cellarsandcentaurs.domain.model.creature_id import CreatureId
from de.sots.cellarsandcentaurs.domain.model.speed import Speed
from de.sots.cellarsandcentaurs.domain.service.creature_service import CreatureService
from de.sots.cellarsandcentaurs.domain.service.creatures import Creatures


@pytest.fixture
def creatures() -> Creatures:
    return Mock(spec=Creatures)


def test_should_save_creature_to_the_stable(creatures):
    service = CreatureService(creatures)
    walkingSpeed = Speed(30)
    creature = Creature(CreatureId("centaur-1"))
    creature.set_speeds({"walking": walkingSpeed})

    service.save(creature)

    creatures.save.assert_called_once_with(creature)
