package de.sots.cellarsandcentaurs.domain.model

class NoSuchCreatureException(id: CreatureId) : RuntimeException("No such creature in the dungeon: " + id.id)
