namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public sealed class Centaur : Creature
{
    private const int GALLOP_BONUS = 2;

    public Centaur(CreatureId id)
        : base(id, CreatureType.Monstrosity)
    {
        Speeds[SpeedType.Walking] = Speed.Of(50);
    }

    public override int Initiative() => base.Initiative() + GALLOP_BONUS;
}
