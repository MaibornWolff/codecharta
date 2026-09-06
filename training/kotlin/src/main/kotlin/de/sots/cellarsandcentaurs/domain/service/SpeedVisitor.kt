package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.Speed

class SpeedVisitor(private val onSpeed: (Speed) -> Unit) {
    fun visit(creature: Creature) {
        creature.speeds.values.forEach(onSpeed)
    }
}
