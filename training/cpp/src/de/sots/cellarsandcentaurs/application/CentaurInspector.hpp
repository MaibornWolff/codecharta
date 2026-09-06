#pragma once

#include "../domain/model/Centaur.hpp"
#include "../domain/model/Creature.hpp"

namespace de::sots::cellarsandcentaurs::application {

class CentaurInspector {
public:
    static bool isCentaur(const domain::model::Creature& creature) {
        return dynamic_cast<const domain::model::Centaur*>(&creature) != nullptr;
    }

    static int walkingFeetPerRound(domain::model::Creature* creature) {
        return static_cast<domain::model::Centaur*>(creature)->getWalkingSpeed().getFeetPerRound();
    }
};

}
