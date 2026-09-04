#pragma once
#include <memory>
#include "Creatures.h"
#include "../model/Creature.h"

namespace de::sots::cellarsandcentaurs::domain::service {

class CreatureService {
    std::shared_ptr<Creatures> creatures_;
public:
    explicit CreatureService(std::shared_ptr<Creatures> creatures);
    void save(const model::Creature& creature);
};

}
