namespace de.sots.cellarsandcentaurs.domain.model
{
    public class Speed
    {
        private int speed;

        public Speed(int speed)
        {
            this.speed = speed;
        }

        public int GetSpeed()
        {
            return speed;
        }

        public void SetSpeed(int speed)
        {
            this.speed = speed;
        }
    }
}