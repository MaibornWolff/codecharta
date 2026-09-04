#include "Creature.h"
#include "../../application/CreatureFacade.h" // Für MONSTROSITY

namespace de::sots::cellarsandcentaurs::domain::model {

Creature::Creature(CreatureId id)
    : id_{std::move(id)}, type_{application::CreatureFacade::STANDARD_CREATURE_TYPE} {}

Creature::Creature(CreatureId id, CreatureType type)
    : id_{std::move(id)}, type_{type} {}

const CreatureId& Creature::getId() const noexcept { return id_; }
void Creature::setId(const CreatureId& id) { id_ = id; }

std::optional<CreatureType> Creature::getType() const { return type_; }
void Creature::setType(CreatureType type) { type_ = type; }

std::optional<ArmorClass> Creature::getArmorClass() const { return armorClass_; }
void Creature::setArmorClass(const ArmorClass& ac) { armorClass_ = ac; }

const std::unordered_map<SpeedType, Speed>& Creature::getSpeeds() const noexcept { return speeds_; }
void Creature::setSpeeds(const std::unordered_map<SpeedType, Speed>& speeds) { speeds_ = speeds; }

std::optional<HitPoints> Creature::getHitPoints() const { return hitPoints_; }
void Creature::setHitPoints(const HitPoints& hp) { hitPoints_ = hp; }

}
