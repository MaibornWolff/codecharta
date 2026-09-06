package de.sots.cellarsandcentaurs.domain.model

@Roams
class Centaur(id: CreatureId) : Creature(id, CreatureType.MONSTROSITY) {
    val gallopSpeed: Speed
        get() = speeds[SpeedType.WALKING] ?: Speed(50)
}
