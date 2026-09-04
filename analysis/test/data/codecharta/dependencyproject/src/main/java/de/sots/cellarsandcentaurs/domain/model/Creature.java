package de.sots.cellarsandcentaurs.domain.model;

import de.sots.cellarsandcentaurs.application.CreatureFacade;

import java.util.Map;

@Fightable
public class Creature {
    CreatureId id;
    CreatureType type;
    ArmorClass armorClass;
    Map<SpeedType, Speed> speeds;
    HitPoints hitPoints;

    public Creature(CreatureId id) {
        this(id, CreatureFacade.STANDARD_CREATURE_TYPE);
    }

    public Creature(CreatureId id, CreatureType type) {
        this.id = id;
    }

    public CreatureId getId() {
        return id;
    }

    public void setId(CreatureId id) {
        this.id = id;
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
}
