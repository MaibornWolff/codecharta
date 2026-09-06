package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.Fightable;

public class Trap {
    private static final int TRAP_INITIATIVE = 20;

    public Object arm() {
        return new Fightable() {
            @Override
            public int initiative() {
                return TRAP_INITIATIVE;
            }
        };
    }
}
