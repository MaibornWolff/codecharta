package de.sots.cellarsandcentaurs.adapter.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
@Persisted(table = "creatures")
public class CreatureEntity {
    @Id
    private UUID id;

    private String type;

    public CreatureEntity() {
    }

    public CreatureEntity(UUID id, String type) {
        this.id = id;
        this.type = type;
    }

    public UUID getId() {
        return id;
    }

    public String getType() {
        return type;
    }
}
