#include "CreatureService.h"

namespace de::sots::cellarsandcentaurs::domain::service {

CreatureService::CreatureService(std::shared_ptr<Creatures> creatures)
    : creatures_{std::move(creatures)} {}

void CreatureService::save(const model::Creature& creature) {
    creatures_->save(creature);
}

}
