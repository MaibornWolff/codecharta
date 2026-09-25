using De.Sots.CellarsAndCentaurs.Domain.Model;

namespace De.Sots.CellarsAndCentaurs.Application;

public partial class CreatureFacade
{
    private const int STABLE_DIE_SIDES = 6;

    public DiceRoll RollForStable() => Dice.Roll(STABLE_DIE_SIDES);
}
