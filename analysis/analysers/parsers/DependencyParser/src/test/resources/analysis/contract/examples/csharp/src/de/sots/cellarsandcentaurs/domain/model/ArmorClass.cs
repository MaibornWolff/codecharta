using de.sots.cellarsandcentaurs.application;

namespace de.sots.cellarsandcentaurs.domain.model
{
    public class ArmorClass
    {
        private int value;
        private string description;

        public ArmorClass(int value)
        {
            this.value = value;
            this.description = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION;
        }

        public int GetValue()
        {
            return value;
        }

        public void SetValue(int value)
        {
            this.value = value;
        }
    }
}
