package de.sots.cellarsandcentaurs.domain.model

import kotlin.random.Random

const val DEFAULT_DIE_SIDES = 20

data class Dice(val sides: Int = DEFAULT_DIE_SIDES) {
    fun roll(): DiceRoll = DiceRoll(Random.nextInt(1, sides + 1))
}

data class DiceRoll(val d20Roll: Int) {
    val isCritical: Boolean
        get() = d20Roll == DEFAULT_DIE_SIDES
}

fun rollD20(): Int = Dice().roll().d20Roll
