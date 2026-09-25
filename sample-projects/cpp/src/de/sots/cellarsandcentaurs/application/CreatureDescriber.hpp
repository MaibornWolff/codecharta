#pragma once

#include <string>

#include "../domain/model/Creature.hpp"

namespace de::sots::cellarsandcentaurs::application {

using domain::model::Creature;

class CreatureDescriber {
public:
    static std::string describe(const Creature& creature) {
        return creature.getId().value();
    }
};

}
