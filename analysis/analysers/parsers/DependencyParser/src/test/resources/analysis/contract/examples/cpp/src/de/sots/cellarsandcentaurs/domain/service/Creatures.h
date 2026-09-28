#pragma once

#include "../model/Creature.h"
#include "../model/CreatureId.h"
#include "../model/NoSuchCreatureException.h"

namespace de::sots::cellarsandcentaurs::domain::service {

class Creatures {
public:
    virtual ~Creatures() = default;
    virtual void save(const de::sots::cellarsandcentaurs::domain::model::Creature&) = 0;
    virtual de::sots::cellarsandcentaurs::domain::model::Creature find(const de::sots::cellarsandcentaurs::domain::model::CreatureId&) = 0;
};

}
