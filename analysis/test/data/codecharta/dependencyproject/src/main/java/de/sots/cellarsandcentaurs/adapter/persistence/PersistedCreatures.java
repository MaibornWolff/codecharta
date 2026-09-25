package de.sots.cellarsandcentaurs.adapter.persistence;

import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.NoSuchCreatureException;
import de.sots.cellarsandcentaurs.domain.service.Creatures;

public class PersistedCreatures implements Creatures {

    private final CreatureRepository repository;

    public PersistedCreatures(CreatureRepository repository) {
        this.repository = repository;
    }

    @Override
    public void save(Creature creature) {
        repository.save(new CreatureEntity(creature.getId().id()));
    }

    @Override
    public Creature find(CreatureId id) throws NoSuchCreatureException {
        CreatureEntity creatureEntity = repository.findById(id.id()).orElseThrow(() -> new NoSuchCreatureException(id));
        return new Creature(new CreatureId(creatureEntity.getId()));
    }
}
