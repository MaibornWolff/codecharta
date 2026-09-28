package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;

public interface Creatures {
    void save(Creature creature);
    Creature find(CreatureId id) throws NoSuchCreatureException;
}
