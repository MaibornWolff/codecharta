using De.Sots.CellarsAndCentaurs.Application;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public sealed class ArmorClass
{
    public int Base { get; private set; }

    public int Bonus { get; private set; }

    public string Description { get; }

    public int Total => Base + Bonus;

    public ArmorClass(int baseValue, int bonus, string? description = null)
    {
        Base = baseValue;
        Bonus = bonus;
        Description = description ?? CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION;
    }

    public void Improve(int bonus)
    {
        Bonus += bonus;
    }
}
