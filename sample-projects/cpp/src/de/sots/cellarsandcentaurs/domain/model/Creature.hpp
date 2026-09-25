#pragma once

#include <map>
#include <optional>

#include "ArmorClass.hpp"
#include "CreatureId.hpp"
#include "CreatureType.hpp"
#include "Fightable.hpp"
#include "HitPoints.hpp"
#include "Speed.hpp"
#include "SpeedType.hpp"

namespace de::sots::cellarsandcentaurs::domain::model {

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
class Creature : public Fightable {
public:
    explicit Creature(CreatureId id);
    Creature(CreatureId id, CreatureType type);

    const CreatureId& getId() const noexcept { return id_; }
    void setId(const CreatureId& id) { id_ = id; }

    CreatureType getType() const noexcept { return type_; }
    void setType(CreatureType type) noexcept { type_ = type; }

    std::optional<ArmorClass> getArmorClass() const { return armorClass_; }
    void setArmorClass(const ArmorClass& armorClass) { armorClass_ = armorClass; }

    const std::map<SpeedType, Speed>& getSpeeds() const noexcept { return speeds_; }
    void setSpeeds(const std::map<SpeedType, Speed>& speeds) { speeds_ = speeds; }

    std::optional<HitPoints> getHitPoints() const { return hitPoints_; }
    void setHitPoints(const HitPoints& hitPoints) { hitPoints_ = hitPoints; }

    int attack() const override;
    bool isAlive() const override;

private:
    CreatureId id_;
    CreatureType type_;
    std::optional<ArmorClass> armorClass_;
    std::map<SpeedType, Speed> speeds_;
    std::optional<HitPoints> hitPoints_;
};

}
