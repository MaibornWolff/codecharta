namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public interface Tameable
{
    int Loyalty();

    bool Obeys() => Loyalty() >= Dice.RollD20();
}
