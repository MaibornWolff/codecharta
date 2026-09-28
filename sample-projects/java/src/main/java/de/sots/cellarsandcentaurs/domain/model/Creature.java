package de.sots.cellarsandcentaurs.domain.model;

import de.sots.cellarsandcentaurs.application.CreatureFacade;

import java.util.Map;

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
public class Creature implements Fightable {
    private final CreatureId id;
    private CreatureType type;
    private ArmorClass armorClass;
    private Map<SpeedType, Speed> speeds;
    private HitPoints hitPoints;
    private XPValue xpValue;

    public Creature(CreatureId id) {
        this(id, CreatureFacade.STANDARD_CREATURE_TYPE);
    }

    public Creature(CreatureId id, CreatureType type) {
        this.id = id;
        this.type = type;
    }

    @Override
    public int initiative() {
        return speeds.get(SpeedType.WALKING).getFeetPerRound() / 10;
    }

    public CreatureId getId() {
        return id;
    }

    public CreatureType getType() {
        return type;
    }

    public void setType(CreatureType type) {
        this.type = type;
    }

    public ArmorClass getArmorClass() {
        return armorClass;
    }

    public void setArmorClass(ArmorClass armorClass) {
        this.armorClass = armorClass;
    }

    public Map<SpeedType, Speed> getSpeeds() {
        return speeds;
    }

    public void setSpeeds(Map<SpeedType, Speed> speeds) {
        this.speeds = speeds;
    }

    public HitPoints getHitPoints() {
        return hitPoints;
    }

    public void setHitPoints(HitPoints hitPoints) {
        this.hitPoints = hitPoints;
    }

    public XPValue getXpValue() {
        return xpValue;
    }

    public void setXpValue(XPValue xpValue) {
        this.xpValue = xpValue;
    }
}
