package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId

interface Creatures {
    fun save(creature: Creature)

    fun find(id: CreatureId): Creature
}
