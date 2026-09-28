package de.sots.cellarsandcentaurs.domain.model;

public class NoSuchCreatureException extends RuntimeException {
    public NoSuchCreatureException(CreatureId id) {
        super(id.id().toString());
    }
}
