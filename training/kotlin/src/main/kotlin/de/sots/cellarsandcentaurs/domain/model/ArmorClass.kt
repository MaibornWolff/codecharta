package de.sots.cellarsandcentaurs.domain.model

import de.sots.cellarsandcentaurs.application.CreatureUtil

data class ArmorClass(
    val base: Int,
    val bonus: Int,
    val description: String = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION
) {
    val total: Int
        get() = base + bonus
}
