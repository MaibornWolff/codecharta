package de.sots.cellarsandcentaurs.domain.model;

import java.util.Random;

public final class Dice {
    private static final Random RANDOM = new Random();
    private static final int D20_SIDES = 20;

    private Dice() {
    }

    public static DiceRoll rollD20() {
        return new DiceRoll(RANDOM.nextInt(D20_SIDES) + 1);
    }
}

record DiceRoll(int d20Roll) {
    boolean isCritical() {
        return d20Roll == 20;
    }
}
