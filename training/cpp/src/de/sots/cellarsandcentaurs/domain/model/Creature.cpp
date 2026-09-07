#include "Creature.hpp"

#include "../../application/Application.hpp"
#include "Dice.hpp"

namespace de::sots::cellarsandcentaurs::domain::model {

Creature::Creature(CreatureId id)
    : Creature(std::move(id), application::CreatureFacade::STANDARD_CREATURE_TYPE) {}

Creature::Creature(CreatureId id, CreatureType type)
    : id_{std::move(id)}, type_{type} {}

int Creature::attack() const {
    return rollD20().value;
}

bool Creature::isAlive() const {
    return hitPoints_.has_value() && hitPoints_->getCurrent() > 0;
}

}
