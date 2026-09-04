package de.sots.cellarsandcentaurs.adapter.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
public class CreatureEntity {
    @Id
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
