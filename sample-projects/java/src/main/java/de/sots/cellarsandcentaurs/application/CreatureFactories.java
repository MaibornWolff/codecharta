package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.Centaur;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.Dice;

import java.util.function.Function;
import java.util.function.Supplier;

public final class CreatureFactories {
    public static final Supplier<Object> INITIATIVE_ROLL = Dice::rollD20;
    public static final Function<CreatureId, Object> CENTAUR_BREEDER = Centaur::new;

    private CreatureFactories() {
    }
}
