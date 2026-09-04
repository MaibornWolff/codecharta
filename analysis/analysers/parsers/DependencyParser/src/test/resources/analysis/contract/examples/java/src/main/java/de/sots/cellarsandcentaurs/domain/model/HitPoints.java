package de.sots.cellarsandcentaurs.domain.model;

public record HitPoints (
    int current,
    int max,
    int temporary
) {
    public HitPoints(int current, int max) {
        this(current, max, 0);
    }

    public static HitPoints init(int max) {
        return new HitPoints(max, max, 0);
    }
}
