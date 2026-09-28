using de.sots.cellarsandcentaurs.domain.model;
using de.sots.cellarsandcentaurs.domain.service;

namespace de.sots.cellarsandcentaurs.application
{
    public class CreatureFacade(CreatureService creatureService)
    {

        public static CreatureType STANDARD_CREATURE_TYPE = CreatureType.MONSTROSITY;

        public void SaveCreature(string name, CreatureType type, int hitPoints, ArmorClass armorClass, Map<SpeedType, Speed> speeds)
        {
            Creature creature = new Creature(name, type, new HitPoints(hitPoints, hitpoints), armorClass, speeds);
            creatureService.Save(creature);
        }

        public Creature FindCreature(CreatureId creatureId)
        {
            return creatureService.Find(creatureId);
        }
    }
}
