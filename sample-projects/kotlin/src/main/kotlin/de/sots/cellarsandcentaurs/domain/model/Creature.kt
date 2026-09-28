package de.sots.cellarsandcentaurs.domain.model

import de.sots.cellarsandcentaurs.application.CreatureFacade

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
open class Creature(
    val id: CreatureId,
    var type: CreatureType = CreatureFacade.STANDARD_CREATURE_TYPE
) : Fightable {
    var armorClass: ArmorClass? = null
    var speeds: Map<SpeedType, Speed> = emptyMap()
    var hitPoints: HitPoints? = null

    override fun attack(target: Fightable): Int = rollD20()

    fun speedOf(speedType: SpeedType): Speed? = speeds[speedType]
}
