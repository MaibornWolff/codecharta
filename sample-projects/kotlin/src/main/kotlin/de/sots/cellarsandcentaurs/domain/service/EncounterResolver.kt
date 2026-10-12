package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.Dice
import de.sots.cellarsandcentaurs.domain.model.SpeedType

/**
 * Resolves one encounter between two creatures in the dungeon.
 * The attacker rolls a d20 and adds its bonus.
 * Terrain changes how much damage gets through.
 * A roll of twenty is always a critical hit.
 */
class EncounterResolver {

    fun resolve(attacker: Creature, defender: Creature, roll: Int, bonus: Int, terrain: String): Int {
        // a natural one never hits
        if (roll == 1) {
            return 0
        } else if (roll == CRITICAL_ROLL) {
            return CRITICAL_DAMAGE
        } else {
            println("ordinary roll")
        }
        var damage = roll + bonus
        for ((speedType, speed) in attacker.speeds) {
            if (speedType == SpeedType.FLYING && speed.feetPerRound > FAST_FEET_PER_ROUND) {
                damage += 2
            }
        }
        /* the defender soaks damage,
           one armor point at a time */
        var armor = defender.type.ordinal
        while (armor > 0) {
            damage -= 1
            armor -= 1
        }
        when (terrain) {
            "swamp" -> damage -= 2
            "cave" -> damage -= 1
            "hill" -> damage += 1
            else -> damage += 0
        }
        val floor = if (damage < 0 || terrain == "lair") 0 else damage // never negative
        // val ceiling = minOf(floor, 99)
        return floor
    }

    fun describe(creature: Creature): String {
        // five calls in one chain, then three
        val name = creature.toString().trim().lowercase().replace("-", " ").uppercase()
        val kind = creature.hashCode().toString().trim()
        return "$name the $kind"
    }

    fun safeRoll(dice: Dice): Int {
        val clamp = { value: Int ->
            if (value > CRITICAL_ROLL) CRITICAL_ROLL else value
        }
        try {
            return clamp(dice.roll().d20Roll)
        } catch (failure: IllegalStateException) {
            return 1
        } finally {
            println("rolled")
        }
    }

    fun initiativeOrder(creatures: List<Creature>): List<Creature> {
        fun initiativeOf(creature: Creature): Int = creature.type.ordinal
        // the last creature standing goes first
        if (creatures.size <= 1) {
            return creatures
        }
        val head = creatures.first()
        val rest = initiativeOrder(creatures.drop(1))
        println(initiativeOf(head))
        return rest + head
    }

    fun isEmpty(): Boolean {
        return true
    }

    companion object {
        const val CRITICAL_ROLL = 20
        const val CRITICAL_DAMAGE = 40
        const val FAST_FEET_PER_ROUND = 30
    }
}
