#pragma once

#include "Creature.hpp"
#include "Speed.hpp"

namespace de::sots::cellarsandcentaurs::domain::model {

class Centaur : public Creature {
public:
    Centaur(CreatureId id, Speed walkingSpeed)
        : Creature(std::move(id), CreatureType::MONSTROSITY), walkingSpeed_{walkingSpeed} {}

    const Speed& getWalkingSpeed() const noexcept { return walkingSpeed_; }

    int XPValue() const noexcept { return 450; }

private:
    Speed walkingSpeed_;
};

}
