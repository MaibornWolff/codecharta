namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public sealed class Speed
{
    public int FeetPerRound { get; }

    public Speed(int feetPerRound)
    {
        FeetPerRound = feetPerRound;
    }

    public static Speed Of(int feetPerRound) => new(feetPerRound);

    public override string ToString() => $"{FeetPerRound} ft.";
}
