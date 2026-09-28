package de.sots.cellarsandcentaurs.domain.model;

public class Centaur extends Creature {
    private static final int HOOVES_DAMAGE = 6;

    public Centaur(CreatureId id) {
        super(id, CreatureType.MONSTROSITY);
    }

    public int hoovesDamage() {
        return HOOVES_DAMAGE;
    }
}
