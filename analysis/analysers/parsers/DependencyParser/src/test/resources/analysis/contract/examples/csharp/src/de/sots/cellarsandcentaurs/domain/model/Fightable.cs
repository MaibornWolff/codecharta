using System;

namespace de.sots.cellarsandcentaurs.domain.model
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class Fightable : Attribute
    {
    }
}