using System;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class LairAttribute : Attribute
{
    public string Location { get; }

    public LairAttribute(string location)
    {
        Location = location;
    }
}
