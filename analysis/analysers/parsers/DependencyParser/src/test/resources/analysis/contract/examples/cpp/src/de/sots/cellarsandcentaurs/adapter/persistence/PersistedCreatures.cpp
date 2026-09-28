#include "PersistedCreatures.h"
#include "../../domain/model/Creature.h"
#include "../../domain/model/NoSuchCreatureException.h"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

PersistedCreatures::PersistedCreatures(std::shared_ptr<CreatureRepository> repository)
    : repository_{std::move(repository)} {}

void PersistedCreatures::save(const domain::model::Creature& creature) {
    repository_->save(CreatureEntity(creature.getId().id()));
}

using namespace de::sots::cellarsandcentaurs::domain::model;

Creature PersistedCreatures::find(const CreatureId& id) {
    auto found = repository_->findById(id.id());
    if (!found) throw NoSuchCreatureException(id);
    return Creature(CreatureId(found->getId()));
}

}
