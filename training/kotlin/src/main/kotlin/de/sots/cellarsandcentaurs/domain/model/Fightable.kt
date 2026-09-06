package de.sots.cellarsandcentaurs.domain.model

sealed interface Fightable {
    fun attack(target: Fightable): Int
}
