package de.sots.cellarsandcentaurs.adapter.web

import de.sots.cellarsandcentaurs.application.toDto
import de.sots.cellarsandcentaurs.domain.model.Creature

class CreaturePresenter {
    fun present(creature: Creature): String = creature.toDto().stable
}
