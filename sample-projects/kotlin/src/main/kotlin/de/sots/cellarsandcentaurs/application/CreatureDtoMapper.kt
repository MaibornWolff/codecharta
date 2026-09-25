package de.sots.cellarsandcentaurs.application

import de.sots.cellarsandcentaurs.domain.model.Creature

fun Creature.toDto(): de.sots.cellarsandcentaurs.application.dto.Creature =
    de.sots.cellarsandcentaurs.application.dto.Creature(id.id, type.name, CreatureFacade.STABLE_NAME)
