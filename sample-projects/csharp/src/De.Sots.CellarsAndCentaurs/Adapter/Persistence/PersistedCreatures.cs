using De.Sots.CellarsAndCentaurs.Application;
using De.Sots.CellarsAndCentaurs.Domain.Model;
using De.Sots.CellarsAndCentaurs.Domain.Service;

namespace De.Sots.CellarsAndCentaurs.Adapter.Persistence;

public class PersistedCreatures : Creatures
{
    private readonly CreatureRepository repository;

    public PersistedCreatures(CreatureRepository repository)
    {
        this.repository = repository;
    }

    public void Save(Creature creature)
    {
        repository.Add(new CreatureEntity(creature.Id.Value, creature.Type, creature.HitPoints?.Max ?? 0));
    }

    public Creature Find(CreatureId id)
    {
        var entity = repository.FindOne(id.Value) ?? throw new NoSuchCreatureException(id);
        return new Creature(new CreatureId(entity.Id), CreatureFacade.STANDARD_CREATURE_TYPE)
        {
            HitPoints = HitPoints.Init(entity.HitPoints)
        };
    }
}
