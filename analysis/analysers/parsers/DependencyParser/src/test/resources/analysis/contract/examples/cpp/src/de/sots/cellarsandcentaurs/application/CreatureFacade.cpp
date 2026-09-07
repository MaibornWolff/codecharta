#include "CreatureFacade.h"
#include "../domain/model/Creature.h"
#include "../domain/model/CreatureId.h"
#include "../domain/service/CreatureService.h"

#include <unordered_map>
#include <random>
#include <sstream>
#include <iomanip>


namespace de::sots::cellarsandcentaurs::application {

CreatureFacade::CreatureFacade(std::shared_ptr<domain::service::CreatureService> creatureService)
    : creatureService_{std::move(creatureService)}
{}

void CreatureFacade::create(
    domain::model::CreatureType type,
    const domain::model::Speed& walkSpeed,
    const domain::model::Speed& flySpeed,
    const domain::model::Speed& swimSpeed,
    const domain::model::Speed& burrowSpeed,
    const domain::model::Speed& climbSpeed,
    const domain::model::ArmorClass& armorClass,
    int hitPointsValue
) {
    using namespace de::sots::cellarsandcentaurs::domain::model;

    Creature creature(CreatureId(generate_uuid()), type);

    creature.setArmorClass(armorClass);
    creature.setHitPoints(HitPoints::init(hitPointsValue));
    std::unordered_map<SpeedType, Speed> speeds{
        {SpeedType::WALKING, walkSpeed},
        {SpeedType::FLYING, flySpeed},
        {SpeedType::SWIMMING, swimSpeed},
        {SpeedType::BURROWING, burrowSpeed},
        {SpeedType::CLIMBING, climbSpeed},
    };
    creature.setSpeeds(speeds);

    creatureService_->save(creature);
}

// A simple UUID generator: for a real project use a UUID lib!
std::string CreatureFacade::generate_uuid() {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(0, 15);
    static std::uniform_int_distribution<> dis2(8, 11);

    std::stringstream ss;
    int i;
    ss << std::hex;
    for (i = 0; i < 8; i++)
        ss << dis(gen);
    ss << "-";
    for (i = 0; i < 4; i++)
        ss << dis(gen);
    ss << "-4";
    for (i = 0; i < 3; i++)
        ss << dis(gen);
    ss << "-";
    ss << dis2(gen);
    for (i = 0; i < 3; i++)
        ss << dis(gen);
    ss << "-";
    for (i = 0; i < 12; i++)
        ss << dis(gen);
    return ss.str();
}

}
