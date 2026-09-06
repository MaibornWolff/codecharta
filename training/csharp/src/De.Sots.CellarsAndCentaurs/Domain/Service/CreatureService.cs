using De.Sots.CellarsAndCentaurs.Domain.Model;
using Microsoft.Extensions.Logging;

namespace De.Sots.CellarsAndCentaurs.Domain.Service;

public class CreatureService
{
    private readonly Creatures creatures;
    private readonly ILogger<CreatureService> logger;

    public CreatureService(Creatures creatures, ILogger<CreatureService> logger)
    {
        this.creatures = creatures;
        this.logger = logger;
    }

    public void Save(Creature creature)
    {
        logger.LogInformation("Saving creature {Id}", creature.Id);
        creatures.Save(creature);
    }

    public Creature Find(CreatureId id) => creatures.Find(id);
}
