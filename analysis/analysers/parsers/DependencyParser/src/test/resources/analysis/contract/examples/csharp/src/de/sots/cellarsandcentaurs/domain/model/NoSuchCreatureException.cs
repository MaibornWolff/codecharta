using System;

namespace de.sots.cellarsandcentaurs.domain.model
{
    public class NoSuchCreatureException : Exception
    {
        public NoSuchCreatureException(CreatureId creatureId)
            : base($"No such creature with ID: {creatureId}")
        {
        }
    }
}