using de.sots.cellarsandcentaurs.domain.model;

namespace de.sots.cellarsandcentaurs.domain.service
{
    public interface Creatures
    {
        void Save(Creature creature);
        Creature Find(CreatureId creatureId);
    }
}