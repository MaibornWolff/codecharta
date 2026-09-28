#pragma once

#include "../model/Creature.hpp"
#include "../model/CreatureId.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

class Creatures {
public:
    virtual ~Creatures() = default;
    virtual void save(const model::Creature& creature) = 0;
    virtual model::Creature find(const model::CreatureId& id) = 0;
};

}
