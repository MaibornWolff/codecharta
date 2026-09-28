package de.sots.cellarsandcentaurs.application

import de.sots.cellarsandcentaurs.domain.model.*
import de.sots.cellarsandcentaurs.domain.model.Fightable
import org.slf4j.Logger
import org.slf4j.LoggerFactory

object CreatureUtil {
    const val STANDARD_ARMOR_CLASS_DESCRIPTION: String = "Natural Armor"

    private val logger: Logger = LoggerFactory.getLogger(CreatureUtil::class.java)

    /*
     * Counts the treasure hoard a creature guards.
     */
    fun treasureHoardOf(creature: Creature): Int {
        val hitPoints = creature.hitPoints ?: HitPoints.init(1)
        logger.info("Counting hoard of {}", creature.id)
        return hitPoints.max * DEFAULT_DIE_SIDES
    }
}
