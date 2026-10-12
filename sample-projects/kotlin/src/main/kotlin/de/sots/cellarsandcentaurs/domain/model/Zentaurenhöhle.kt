package de.sots.cellarsandcentaurs.domain.model

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
class Zentaurenhöhle(val rüstungsklasse: ArmorClass, val bewohner: List<Centaur>) {
    val beschreibung: String = "Größe der Höhle"

    fun `zählt die bewohner`(): Int = bewohner.size
}
