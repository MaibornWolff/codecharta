package de.sots.cellarsandcentaurs.domain.service;

import de.sots.cellarsandcentaurs.domain.model.Creature;

public class CreatureService {
    private final Creatures creatures;

    public CreatureService(Creatures creatures) {
        this.creatures = creatures;
    }

    public void save(Creature creature) {
        creatures.save(creature);
    }
}
