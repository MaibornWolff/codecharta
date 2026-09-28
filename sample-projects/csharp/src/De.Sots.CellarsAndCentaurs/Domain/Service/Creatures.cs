using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Domain.Service;

public interface Creatures
{
    void Save(Creature creature);

    Creature Find(CreatureId id);
}
