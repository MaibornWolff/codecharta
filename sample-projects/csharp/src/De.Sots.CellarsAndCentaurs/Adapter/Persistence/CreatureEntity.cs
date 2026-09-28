using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace De.Sots.CellarsAndCentaurs.Adapter.Persistence;

[Table("creatures")]
public class CreatureEntity
{
    [Key]
    public Guid Id { get; set; }

    public CreatureType Type { get; set; }

    public int HitPoints { get; set; }

    public CreatureEntity()
    {
    }

    public CreatureEntity(Guid id, CreatureType type, int hitPoints)
    {
        Id = id;
        Type = type;
        HitPoints = hitPoints;
    }
}
