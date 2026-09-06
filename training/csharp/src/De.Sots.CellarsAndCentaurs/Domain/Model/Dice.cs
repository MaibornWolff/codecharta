using System;

namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public static class Dice
{
    private static readonly Random Random = new();

    public static int RollD20() => Roll(20).Value;

    public static DiceRoll Roll(int sides) => new(sides, Random.Next(1, sides + 1));
}

public readonly record struct DiceRoll(int Sides, int Value)
{
    public bool IsCritical => Value == Sides;
}
