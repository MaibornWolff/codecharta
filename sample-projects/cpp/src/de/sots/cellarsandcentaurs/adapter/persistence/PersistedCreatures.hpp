#pragma once

#include <memory>

#include "../../domain/model/Creature.hpp"
#include "../../domain/model/CreatureId.hpp"
#include "../../domain/service/Creatures.hpp"
#include "CreatureRepository.hpp"

namespace de::sots::cellarsandcentaurs::adapter::persistence {

class PersistedCreatures : public domain::service::Creatures {
public:
    explicit PersistedCreatures(std::shared_ptr<CreatureRepository> repository);

    void save(const domain::model::Creature& creature) override;
    domain::model::Creature find(const domain::model::CreatureId& id) override;

private:
    std::shared_ptr<CreatureRepository> repository_;
};

}
