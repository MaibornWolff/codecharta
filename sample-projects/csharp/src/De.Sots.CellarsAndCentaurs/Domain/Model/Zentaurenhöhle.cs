namespace De.Sots.CellarsAndCentaurs.Domain.Model;

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
public class Zentaurenhöhle
{
    private readonly int rüstungsklasse;

    public Zentaurenhöhle(int rüstungsklasse)
    {
        this.rüstungsklasse = rüstungsklasse;
    }

    public string Describe() => "Größe der Höhle" + rüstungsklasse;
}
