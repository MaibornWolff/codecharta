package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.*;
import de.sots.cellarsandcentaurs.domain.model.Fightable;

public final class CreatureUtil {
    public static final String STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor";
    private static final int GOLD_PER_HIT_POINT = 3;

    private CreatureUtil() {
    }

    /*
     * Counts the treasure hoard a creature guards.
     */
    public static int treasureHoard(Creature creature) {
        HitPoints hitPoints = creature.getHitPoints();
        return hitPoints.getMax() * GOLD_PER_HIT_POINT;
    }

    public static boolean isWounded(Creature creature) {
        return creature.getHitPoints().getCurrent() < creature.getHitPoints().getMax();
    }
}
