namespace De.Sots.CellarsAndCentaurs.Domain.Model;

/// <summary>
/// Hit points drop when the creature takes damage and recover when it rests in its lair.
/// </summary>
public sealed class HitPoints
{
    public const int MAX_HIT_POINTS = 999;

    public int Current { get; private set; }

    public int Max { get; }

    public int Temporary { get; private set; }

    public HitPoints(int current, int max, int temporary = 0)
    {
        Current = current;
        Max = Math.Min(max, MAX_HIT_POINTS);
        Temporary = temporary;
    }

    public static HitPoints Init(int max) => new(max, max);

    public HitPoints Damaged(int damage) => new(Math.Max(0, Current - damage), Max, Temporary);

    public HitPoints Rested() => new(Max, Max, Temporary);
}
