namespace De.Sots.CellarsAndCentaurs.Application
{
    using De.Sots.CellarsAndCentaurs.Domain.Model;

    public class StableLedger
    {
        public HitPoints Rest(HitPoints hitPoints) => hitPoints.Rested();
    }
}
