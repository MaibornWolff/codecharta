package de.sots.cellarsandcentaurs.domain.model;

import java.util.UUID;

public record CreatureId(UUID id) {
    public static CreatureId random() {
        return new CreatureId(UUID.randomUUID());
    }
}
