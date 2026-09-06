package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.rollD20

class Initiative {
    fun roll(): Int = rollD20()
}
