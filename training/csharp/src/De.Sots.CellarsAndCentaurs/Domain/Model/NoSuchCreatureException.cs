using System;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public class NoSuchCreatureException : Exception
{
    public CreatureId Id { get; }

    public NoSuchCreatureException(CreatureId id)
        : base("No such creature in the dungeon: " + id.Value)
    {
        Id = id;
    }
}
