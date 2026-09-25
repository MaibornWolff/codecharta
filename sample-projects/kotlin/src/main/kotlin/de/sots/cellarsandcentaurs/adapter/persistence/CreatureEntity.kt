package de.sots.cellarsandcentaurs.adapter.persistence

import java.util.UUID

class CreatureEntity(id: String? = null) {
    val id: String = id ?: UUID.randomUUID().toString()
    var typeName: String = ""
    var walkingSpeed: Int = 0
    var hitPointsMax: Int = 0
}
