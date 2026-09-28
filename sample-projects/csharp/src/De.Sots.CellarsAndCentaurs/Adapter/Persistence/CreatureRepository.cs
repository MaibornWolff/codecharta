using System;

namespace De.Sots.CellarsAndCentaurs.Adapter.Persistence
{
    using Entity = De.Sots.CellarsAndCentaurs.Adapter.Persistence.CreatureEntity;

    public class CreatureRepository : Repository<Entity>
    {
        protected override Guid IdOf(Entity item) => item.Id;

        public Entity? FindByType(string typeName)
        {
            foreach (var entity in FindAll())
            {
                if (entity.Type.ToString() == typeName)
                {
                    return entity;
                }
            }
            return null;
        }
    }
}
