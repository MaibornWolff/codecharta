using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Domain.Service;

public static class CreatureExtensions
{
    public static bool IsBloodied(this Creature creature, int divisor = 2)
    {
        return creature.HitPoints != null && creature.HitPoints.Current < creature.HitPoints.Max / divisor;
    }
}
