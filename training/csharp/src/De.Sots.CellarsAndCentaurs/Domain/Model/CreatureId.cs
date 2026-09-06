using System;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public readonly record struct CreatureId(Guid Value)
{
    public static CreatureId NewId() => new(Guid.NewGuid());
}
