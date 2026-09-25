#include "CreatureService.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

CreatureService::CreatureService(std::shared_ptr<Creatures> creatures)
    : creatures_{std::move(creatures)} {}

void CreatureService::save(const model::Creature& creature) {
    creatures_->save(creature);
}

model::Creature CreatureService::find(const model::CreatureId& id) {
    return creatures_->find(id);
}

}
