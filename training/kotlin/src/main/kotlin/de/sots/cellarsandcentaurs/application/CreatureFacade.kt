package de.sots.cellarsandcentaurs.application

import de.sots.cellarsandcentaurs.domain.model.ArmorClass
import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId
import de.sots.cellarsandcentaurs.domain.model.CreatureType
import de.sots.cellarsandcentaurs.domain.model.HitPoints
import de.sots.cellarsandcentaurs.domain.model.Speed
import de.sots.cellarsandcentaurs.domain.model.SpeedType
import de.sots.cellarsandcentaurs.domain.service.CreatureService
import java.util.UUID

class CreatureFacade(private val creatureService: CreatureService) {

    fun create(
        type: CreatureType,
        walkingSpeed: Speed,
        flyingSpeed: Speed,
        swimmingSpeed: Speed,
        burrowingSpeed: Speed,
        climbingSpeed: Speed,
        armorClass: ArmorClass,
        hitPointsValue: Int
    ): Creature {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        val creature = Creature(CreatureId(UUID.randomUUID().toString()), type)
        creature.armorClass = armorClass
        creature.hitPoints = HitPoints.init(hitPointsValue)
        creature.speeds = mapOf(
            SpeedType.WALKING to walkingSpeed,
            SpeedType.FLYING to flyingSpeed,
            SpeedType.SWIMMING to swimmingSpeed,
            SpeedType.BURROWING to burrowingSpeed,
            SpeedType.CLIMBING to climbingSpeed
        )
        creatureService.save(creature)
        return creature
    }

    fun toDto(creature: Creature): de.sots.cellarsandcentaurs.application.dto.Creature =
        de.sots.cellarsandcentaurs.application.dto.Creature(creature.id.id, creature.type.name, STABLE_NAME)

    class Builder {
        private var creatureService: CreatureService? = null

        fun withService(creatureService: CreatureService): Builder = apply { this.creatureService = creatureService }

        fun build(): CreatureFacade = CreatureFacade(requireNotNull(creatureService) { "creature service missing" })
    }

    companion object {
        val STANDARD_CREATURE_TYPE: CreatureType = CreatureType.MONSTROSITY
        const val STABLE_NAME = "centaur-stable"
    }
}
