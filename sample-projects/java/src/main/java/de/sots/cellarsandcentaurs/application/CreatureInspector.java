package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.Centaur;
import de.sots.cellarsandcentaurs.domain.model.Speed;

public final class CreatureInspector {
    private CreatureInspector() {
    }

    public static boolean isCentaur(Object creature) {
        return creature instanceof Centaur;
    }

    public static int totalFeetPerRound(Speed[] speeds) {
        int total = 0;
        for (var speed : speeds) {
            total += speed.getFeetPerRound();
        }
        return total;
    }
}
