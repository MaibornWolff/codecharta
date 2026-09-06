#pragma once

#include <memory>

#include "../model/Creature.hpp"
#include "../model/CreatureId.hpp"
#include "Creatures.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

class CreatureService {
public:
    explicit CreatureService(std::shared_ptr<Creatures> creatures);

    void save(const model::Creature& creature);
    model::Creature find(const model::CreatureId& id);

private:
    std::shared_ptr<Creatures> creatures_;
};

}
