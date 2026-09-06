#pragma once

#include <memory>

#include "../domain/model/ArmorClass.hpp"
#include "../domain/model/Creature.hpp"
#include "../domain/model/CreatureType.hpp"
#include "../domain/model/Speed.hpp"
#include "../domain/service/CreatureService.hpp"
#include "dto/Creature.hpp"

namespace de::sots::cellarsandcentaurs::application {

class CreatureFacade {
public:
    static constexpr domain::model::CreatureType STANDARD_CREATURE_TYPE = domain::model::CreatureType::MONSTROSITY;
    static constexpr const char* STABLE_NAME = "centaur-stable";

    explicit CreatureFacade(std::shared_ptr<domain::service::CreatureService> creatureService);

    domain::model::Creature create(
        domain::model::CreatureType type,
        const domain::model::Speed& walkingSpeed,
        const domain::model::Speed& flyingSpeed,
        const domain::model::Speed& swimmingSpeed,
        const domain::model::Speed& burrowingSpeed,
        const domain::model::Speed& climbingSpeed,
        const domain::model::ArmorClass& armorClass,
        int hitPointsValue);

    dto::Creature toDto(const domain::model::Creature& creature) const;

private:
    std::string generateUuid() const;

    std::shared_ptr<domain::service::CreatureService> creatureService_;
};

}
