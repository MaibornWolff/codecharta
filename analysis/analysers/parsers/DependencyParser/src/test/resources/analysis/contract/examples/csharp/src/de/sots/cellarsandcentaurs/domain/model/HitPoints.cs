namespace de.sots.cellarsandcentaurs.domain.model
{
    public class HitPoints
    {
        private int current;
        private int max;
        private int temporary;

        public HitPoints(int current, int max)
        {
            this.current = current;
            this.max = max;
            this.temporary = 0;
        }

        public static HitPoints init(int max)
        {
            return new HitPoints(max, max, 0);
        }
    }
}
