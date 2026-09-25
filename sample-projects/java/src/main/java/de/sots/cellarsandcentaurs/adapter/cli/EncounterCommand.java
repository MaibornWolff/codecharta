package de.sots.cellarsandcentaurs.adapter.cli;

import de.sots.cellarsandcentaurs.application.CreatureFacade.Builder;

public class EncounterCommand {
    public void run() {
        var facade = new Builder().build();
        facade.createCentaur();
    }
}
