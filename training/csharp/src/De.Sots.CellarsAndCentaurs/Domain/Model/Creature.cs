using System.Collections.Generic;
using De.Sots.CellarsAndCentaurs.Application;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

/// <summary>
/// A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
/// </summary>
public class Creature : Fightable
{
    public CreatureId Id { get; }

    public CreatureType Type { get; set; }

    public ArmorClass? ArmorClass { get; set; }

    public HitPoints? HitPoints { get; set; }

    public IDictionary<SpeedType, Speed> Speeds { get; set; } = new Dictionary<SpeedType, Speed>();

    public Creature(CreatureId id)
        : this(id, CreatureFacade.STANDARD_CREATURE_TYPE)
    {
    }

    public Creature(CreatureId id, CreatureType type)
    {
        Id = id;
        Type = type;
    }

    public virtual int Initiative() => Dice.RollD20();

    public void TakeDamage(int damage)
    {
        HitPoints = HitPoints?.Damaged(damage);
    }

    public Speed? SpeedOf(SpeedType speedType) => Speeds.TryGetValue(speedType, out var speed) ? speed : null;
}
