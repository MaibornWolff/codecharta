package de.sots.cellarsandcentaurs.domain.service

import de.sots.cellarsandcentaurs.domain.model.Centaur

class CentaurDetector {
    fun isCentaur(candidate: Any): Boolean = candidate is Centaur
}
