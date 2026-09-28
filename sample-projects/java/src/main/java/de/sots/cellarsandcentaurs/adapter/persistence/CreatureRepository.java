package de.sots.cellarsandcentaurs.adapter.persistence;

import java.util.UUID;

public class CreatureRepository extends Repository<CreatureEntity> {
    @Override
    protected UUID idOf(CreatureEntity row) {
        return row.getId();
    }
}
