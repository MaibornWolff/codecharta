package de.sots.cellarsandcentaurs.domain.model;

public class NoSuchCreatureException extends RuntimeException {
    public NoSuchCreatureException(CreatureId id) {
        super("No such creature in the dungeon: " + id.id());
    }
}
