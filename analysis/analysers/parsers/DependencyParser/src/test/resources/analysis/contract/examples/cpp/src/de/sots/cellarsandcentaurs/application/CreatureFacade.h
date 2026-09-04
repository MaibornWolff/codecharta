#pragma once

#include <memory>
#include "../domain/model/Creature.h"
#include "../domain/model/ArmorClass.h"
#include "../domain/model/Speed.h"
#include "../domain/service/CreatureService.h"

namespace de::sots::cellarsandcentaurs::application {

class CreatureFacade {
public:
    static constexpr domain::model::CreatureType STANDARD_CREATURE_TYPE =
        domain::model::CreatureType::MONSTROSITY;

    explicit CreatureFacade(std::shared_ptr<domain::service::CreatureService> creatureService);

    void create(
        domain::model::CreatureType type,
        const de::sots::cellarsandcentaurs::domain::model::Speed& walkSpeed,
        const de::sots::cellarsandcentaurs::domain::model::Speed& flySpeed,
        const de::sots::cellarsandcentaurs::domain::model::Speed& swimSpeed,
        const de::sots::cellarsandcentaurs::domain::model::Speed& burrowSpeed,
        const de::sots::cellarsandcentaurs::domain::model::Speed& climbSpeed,
        const de::sots::cellarsandcentaurs::domain::model::ArmorClass& armorClass,
        int hitPointsValue
    );

private:
    std::shared_ptr<de::sots::cellarsandcentaurs::domain::service::CreatureService> creatureService_;
    static std::string generate_uuid();
};

}
