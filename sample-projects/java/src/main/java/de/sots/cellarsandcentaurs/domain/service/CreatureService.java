package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CreatureService {
    private static final Logger LOGGER = LoggerFactory.getLogger(CreatureService.class);

    private final Creatures creatures;

    public CreatureService(Creatures creatures) {
        this.creatures = creatures;
    }

    public void save(Creature creature) {
        LOGGER.info("Saving creature {}", creature.getId());
        creatures.save(creature);
    }

    public Creature find(CreatureId id) throws NoSuchCreatureException {
        return creatures.find(id);
    }
}
