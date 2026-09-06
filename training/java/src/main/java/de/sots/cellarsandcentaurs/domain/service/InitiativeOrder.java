package de.sots.cellarsandcentaurs.domain.service;

import static de.sots.cellarsandcentaurs.domain.model.Dice.*;

public class InitiativeOrder {
    public Object rollForEncounter() {
        return rollD20();
    }
}
