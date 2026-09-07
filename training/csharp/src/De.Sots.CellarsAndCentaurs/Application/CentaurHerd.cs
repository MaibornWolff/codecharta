using System.Collections.Generic;
using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Application;

public class CentaurHerd
{
    private readonly List<Centaur> members = new();

    public int Size => members.Count;
}
