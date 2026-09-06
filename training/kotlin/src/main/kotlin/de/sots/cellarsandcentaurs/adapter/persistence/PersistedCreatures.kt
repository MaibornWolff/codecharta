package de.sots.cellarsandcentaurs.adapter.persistence

import de.sots.cellarsandcentaurs.application.CreatureFacade
import de.sots.cellarsandcentaurs.domain.model.Creature
import de.sots.cellarsandcentaurs.domain.model.CreatureId
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException
import de.sots.cellarsandcentaurs.domain.service.Creatures
import org.slf4j.LoggerFactory

class PersistedCreatures(private val repository: CreatureRepository) : Creatures {
    private val logger = LoggerFactory.getLogger(PersistedCreatures::class.java)

    override fun save(creature: Creature) {
        logger.debug("Saving creature {}", creature.id)
        repository.save(CreatureEntity(creature.id.id))
    }

    override fun find(id: CreatureId): Creature {
        val creatureEntity = repository.findOne(id.id) ?: throw NoSuchCreatureException(id)
        return Creature(CreatureId(creatureEntity.id), CreatureFacade.STANDARD_CREATURE_TYPE)
    }
}
