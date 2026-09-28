package de.sots.cellarsandcentaurs.adapter.persistence;

import java.util.UUID;

public class CreatureEntity {
    private UUID id;

    public CreatureEntity(UUID id) {
        this.id = id;
    }

    public CreatureEntity() {
    }

    public UUID getId() {
        return id;
    }
}
