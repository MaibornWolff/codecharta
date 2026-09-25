#include "PersistedCreatures.hpp"

#include "../../application/Application.hpp"
#include "../../domain/model/NoSuchCreatureException.hpp"
#include "CreatureEntity.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

PersistedCreatures::PersistedCreatures(std::shared_ptr<CreatureRepository> repository)
    : repository_{std::move(repository)} {}

void PersistedCreatures::save(const domain::model::Creature& creature) {
    CreatureEntity entity;
    entity.id = creature.getId().value();
    entity.hitPoints = creature.getHitPoints() ? creature.getHitPoints()->getCurrent() : 0;
    repository_->save(entity);
}

domain::model::Creature PersistedCreatures::find(const domain::model::CreatureId& id) {
    auto entity = repository_->findOne(id.value());
    if (!entity) {
        throw domain::model::NoSuchCreatureException(id);
    }
    return domain::model::Creature(domain::model::CreatureId(entity->id), application::CreatureFacade::STANDARD_CREATURE_TYPE);
}

}
