#include "CreatureFacade.hpp"

#include <boost/uuid/uuid_generators.hpp>
#include <boost/uuid/uuid_io.hpp>
#include <map>
#include <spdlog/spdlog.h>

#include "../domain/model/CreatureId.hpp"
#include "../domain/model/HitPoints.hpp"
#include "../domain/model/SpeedType.hpp"

namespace de::sots::cellarsandcentaurs::application {

CreatureFacade::CreatureFacade(std::shared_ptr<domain::service::CreatureService> creatureService)
    : creatureService_{std::move(creatureService)} {}

domain::model::Creature CreatureFacade::create(
    domain::model::CreatureType type,
    const domain::model::Speed& walkingSpeed,
    const domain::model::Speed& flyingSpeed,
    const domain::model::Speed& swimmingSpeed,
    const domain::model::Speed& burrowingSpeed,
    const domain::model::Speed& climbingSpeed,
    const domain::model::ArmorClass& armorClass,
    int hitPointsValue) {
    // Rolls initiative for every creature in the dungeon before the encounter starts.
    domain::model::Creature creature(domain::model::CreatureId(generateUuid()), type);
    creature.setArmorClass(armorClass);
    creature.setHitPoints(domain::model::HitPoints::init(hitPointsValue));

    std::map<domain::model::SpeedType, de::sots::cellarsandcentaurs::domain::model::Speed> speeds;
    speeds.emplace(domain::model::SpeedType::WALKING, walkingSpeed);
    speeds.emplace(domain::model::SpeedType::FLYING, flyingSpeed);
    speeds.emplace(domain::model::SpeedType::SWIMMING, swimmingSpeed);
    speeds.emplace(domain::model::SpeedType::BURROWING, burrowingSpeed);
    speeds.emplace(domain::model::SpeedType::CLIMBING, climbingSpeed);
    creature.setSpeeds(speeds);

    spdlog::info("Saving creature {} to {}", creature.getId().value(), STABLE_NAME);
    creatureService_->save(creature);
    return creature;
}

dto::Creature CreatureFacade::toDto(const domain::model::Creature& creature) const {
    dto::Creature result;
    result.id = creature.getId().value();
    result.hitPoints = creature.getHitPoints() ? creature.getHitPoints()->getCurrent() : 0;
    result.armorClass = creature.getArmorClass() ? creature.getArmorClass()->getTotal() : 0;
    return result;
}

std::string CreatureFacade::generateUuid() const {
    boost::uuids::random_generator generator;
    return boost::uuids::to_string(generator());
}

}
