using de.sots.cellarsandcentaurs.domain.model;

namespace de.sots.cellarsandcentaurs.domain.service
{
    [Service]
    public class CreatureService
    {
        private readonly Creatures creatures;

        public CreatureService(Creatures creatures)
        {
            this.creatures = creatures;
        }

        public void Save(Creature creature)
        {
            creatures.Save(creature);
        }
    }
}
