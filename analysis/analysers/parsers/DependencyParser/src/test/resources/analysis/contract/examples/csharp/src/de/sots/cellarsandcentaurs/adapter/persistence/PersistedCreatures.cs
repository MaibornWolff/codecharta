using de.sots.cellarsandcentaurs.domain.model;
using de.sots.cellarsandcentaurs.domain.service;
using System;
using Microsoft.Extensions.DependencyInjection;

namespace de.sots.cellarsandcentaurs.adapter.persistence
{
    [Service]
    public class PersistedCreatures : Creatures
    {
        private readonly CreatureRepository repository;

        public PersistedCreatures(CreatureRepository repository)
        {
            this.repository = repository;
        }

        public void Save(Creature creature)
        {
            repository.Add(new CreatureEntity(creature.Id.Id));
        }

        public Creature Find(CreatureId id)
        {
            var creatureEntity = repository.Find(id.Id) ?? throw new NoSuchCreatureException(id);
            return new Creature(new CreatureId(creatureEntity.Id));
        }
    }
}