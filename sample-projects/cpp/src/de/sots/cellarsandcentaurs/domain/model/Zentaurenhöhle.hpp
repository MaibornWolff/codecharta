#pragma once

#include <string>

namespace de::sots::cellarsandcentaurs::domain::model {

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
class Zentaurenhöhle {
public:
    explicit Zentaurenhöhle(int rüstungsklasse) : rüstungsklasse{rüstungsklasse} {}

    std::string beschreibung() const { return "Größe der Höhle"; }

    int rüstungsklasse;
};

}
