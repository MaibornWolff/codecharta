package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId

class CreatureService(private val creatures: Creatures) {

    fun save(creature: Creature) {
        creatures.save(creature)
    }

    fun find(id: CreatureId): Creature = creatures.find(id)

    fun defaultWalkingSpeed(): de.sots.cellarsandcentaurs.domain.model.Speed = de.sots.cellarsandcentaurs.domain.model.Speed(30)
}
