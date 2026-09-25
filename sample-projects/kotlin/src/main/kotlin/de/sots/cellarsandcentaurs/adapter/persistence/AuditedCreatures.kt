package de.sots.cellarsandcentaurs.adapter.persistence

import de.sots.cellarsandcentaurs.domain.service.Creatures
import org.slf4j.LoggerFactory

class AuditedCreatures : Creatures by PersistedCreatures(CreatureRepository()) {
    private val logger = LoggerFactory.getLogger(AuditedCreatures::class.java)

    fun audit() {
        logger.info("Auditing the stable")
    }
}
