package de.sots.cellarsandcentaurs.adapter.persistence

import de.sots.cellarsandcentaurs.adapter.persistence.CreatureEntity as Entity

class CreatureRepository : Repository<Entity>() {
    override fun keyOf(item: Entity): String = item.id
}
