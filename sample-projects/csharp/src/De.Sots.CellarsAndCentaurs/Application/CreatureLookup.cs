using De.Sots.CellarsAndCentaurs.Domain.Model;
using De.Sots.CellarsAndCentaurs.Domain.Service;

namespace De.Sots.CellarsAndCentaurs.Application;

public class CreatureLookup
{
    private readonly CreatureService creatureService;

    public CreatureLookup(CreatureService creatureService)
    {
        this.creatureService = creatureService;
    }

    public Creature? FindOrNull(CreatureId id)
    {
        try
        {
            return creatureService.Find(id);
        }
        catch (NoSuchCreatureException)
        {
            return null;
        }
    }
}
