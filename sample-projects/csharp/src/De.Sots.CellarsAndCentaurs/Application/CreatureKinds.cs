using System;
using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Application;

public static class CreatureKinds
{
    public static readonly Type CENTAUR_KIND = typeof(Centaur);

    public const string BASE_KIND_NAME = nameof(Creature);
}
