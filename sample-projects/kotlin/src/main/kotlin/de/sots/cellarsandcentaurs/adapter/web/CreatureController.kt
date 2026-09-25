package de.sots.cellarsandcentaurs.adapter.web

import de.sots.cellarsandcentaurs.application.CreatureFacade.Builder
import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.service.CreatureService

class CreatureController(creatureService: CreatureService) {
    private val facade = Builder().withService(creatureService).build()

    fun describe(creature: Creature): String = facade.toDto(creature).stable
}
