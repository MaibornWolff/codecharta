namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public readonly record struct XPValue(int Points)
{
    public static XPValue ForCreature(Creature creature) => new(creature.HitPoints?.Max ?? 0);
}
