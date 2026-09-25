package de.sots.cellarsandcentaurs.domain.model;

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
public class HitPoints {
    public static final int MAX_HIT_POINTS = 999;

    private final int current;
    private final int max;
    private final int temporary;

    public HitPoints(int current, int max, int temporary) {
        this.current = Math.min(current, MAX_HIT_POINTS);
        this.max = Math.min(max, MAX_HIT_POINTS);
        this.temporary = temporary;
    }

    public static HitPoints init(int max) {
        return new HitPoints(max, max, 0);
    }

    public HitPoints takeDamage(int damage) {
        return new HitPoints(current - damage, max, temporary);
    }

    public HitPoints rest() {
        return new HitPoints(max, max, 0);
    }

    public int getCurrent() {
        return current;
    }

    public int getMax() {
        return max;
    }

    public int getTemporary() {
        return temporary;
    }
}
