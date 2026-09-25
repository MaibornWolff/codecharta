namespace De.Sots.CellarsAndCentaurs.Domain.Model;

public interface Fightable
{
    int Initiative();

    void TakeDamage(int damage);
}
