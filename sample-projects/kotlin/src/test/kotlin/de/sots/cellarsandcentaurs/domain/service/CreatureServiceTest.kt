package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId
import de.sots.cellarsandcentaurs.domain.model.Speed
import de.sots.cellarsandcentaurs.domain.model.SpeedType
import io.mockk.mockk
import io.mockk.verify
import kotlin.test.Test
import kotlin.test.assertEquals

class CreatureServiceTest {

    @Test
    fun should_save_creature_to_the_stable() {
        // Arrange
        val creatures = mockk<Creatures>(relaxed = true)
        val creatureService = CreatureService(creatures)
        val walking_speed = Speed(40)
        val XPValue = 200
        val creature = Creature(CreatureId("centaur-1"))
        creature.speeds = mapOf(SpeedType.WALKING to walking_speed)

        // Act
        creatureService.save(creature)

        // Assert
        verify { creatures.save(creature) }
        assertEquals(40, creature.speedOf(SpeedType.WALKING)?.feetPerRound)
        assertEquals(200, XPValue)
    }
}
