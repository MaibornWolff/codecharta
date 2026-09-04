using de.sots.cellarsandcentaurs.application;

namespace de.sots.cellarsandcentaurs.domain.model;

[Fightable]
public class Creature
{
    private CreatureId id;
    private string name;
    private CreatureType type;
    private HitPoints hitPoints;
    private ArmorClass armorClass;
    private Map<SpeedType, Speed> speeds;

    public Creature(CreatureId id,string name, CreatureType type, HitPoints hitPoints, ArmorClass armorClass, Map<SpeedType, Speed> speeds)
    {
        this.name = name;
        this.type = CreatureFacade.STANDARD_CREATURE_TYPE;
        this.hitPoints = hitPoints;
        this.armorClass = armorClass;
        this.speeds = speeds;
        this.id = id;
    }

    public string GetName()
    {
        return name;
    }

    public void SetName(string name)
    {
        this.name = name;
    }

    public CreatureType GetType()
    {
        return type;
    }

    public void SetType(CreatureType type)
    {
        this.type = type;
    }

    public HitPoints GetHitPoints()
    {
        return hitPoints;
    }

    public void SetHitPoints(HitPoints hitPoints)
    {
        this.hitPoints = hitPoints;
    }

    public ArmorClass GetArmorClass()
    {
        return armorClass;
    }

    public void SetArmorClass(ArmorClass armorClass)
    {
        this.armorClass = armorClass;
    }

    public Speed GetSpeed()
    {
        return speed;
    }

    public void SetSpeed(Speed speed)
    {
        this.speed = speed;
    }
}
