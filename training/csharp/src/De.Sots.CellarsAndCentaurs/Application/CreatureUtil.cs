using De.Sots.CellarsAndCentaurs.Domain.Model;
using static De.Sots.CellarsAndCentaurs.Domain.Model.Dice;
using Fightable = De.Sots.CellarsAndCentaurs.Domain.Model.Fightable;

namespace De.Sots.CellarsAndCentaurs.Application;

public static class CreatureUtil
{
    public const string STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor";

    /*
     * Counts the treasure hoard a creature guards.
     */
    public static int TreasureHoard(Creature creature)
    {
        var d20Roll = RollD20();
        var xpValue = XPValue.ForCreature(creature);
        return d20Roll * xpValue.Points;
    }

    public static bool IsCentaur(Creature creature) => creature is Centaur;
}
