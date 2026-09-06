package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Dice

class DiceInspector {
    fun diceKindName(): String = Dice::class.simpleName ?: ""
}
