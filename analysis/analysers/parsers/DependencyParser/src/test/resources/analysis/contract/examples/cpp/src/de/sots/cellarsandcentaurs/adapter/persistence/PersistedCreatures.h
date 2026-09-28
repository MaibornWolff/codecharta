#pragma once
#include <memory>
#include "CreatureRepository.h"
#include "../../domain/model/Creature.h"
#include "../../domain/model/CreatureId.h"
#include "../../domain/service/Creatures.h"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

class PersistedCreatures : public de::sots::cellarsandcentaurs::domain::service::Creatures {
    std::shared_ptr<CreatureRepository> repository_;
public:
    explicit PersistedCreatures(std::shared_ptr<CreatureRepository> repository);
    void save(const domain::model::Creature& creature) override;
    de::sots::cellarsandcentaurs::domain::model::Creature find(const de::sots::cellarsandcentaurs::domain::model::CreatureId& id) override;
};

}
