package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.Creature;

/**
 * Names the lair a {@link Creature} retreats to after the encounter.
 */
public final class LairGuide {
    private LairGuide() {
    }

    public static String lairOf(String creatureName) {
        return creatureName + " lair";
    }
}
