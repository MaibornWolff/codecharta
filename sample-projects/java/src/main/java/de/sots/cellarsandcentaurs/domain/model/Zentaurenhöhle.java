package de.sots.cellarsandcentaurs.domain.model;

/**
 * Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
 */
public class Zentaurenhöhle {
    private final ArmorClass rüstungsklasse;

    public Zentaurenhöhle(ArmorClass rüstungsklasse) {
        this.rüstungsklasse = rüstungsklasse;
    }

    public ArmorClass rüstungsklasse() {
        return rüstungsklasse;
    }

    public String größe() {
        return "Größe der Höhle";
    }
}
