using System;
using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Application;

public static class CreatureChecks
{
    private static readonly Delegate HAS_HIT_POINTS = (Creature creature) => creature.HitPoints != null;

    public static bool HasHitPoints(object candidate) => (bool) HAS_HIT_POINTS.DynamicInvoke(candidate)!;
}
