#pragma once

#include <unordered_map>
#include <optional>
#include "CreatureId.h"
#include "CreatureType.h"
#include "ArmorClass.h"
#include "SpeedType.h"
#include "Speed.h"
#include "HitPoints.h"

namespace de::sots::cellarsandcentaurs::domain::model {

class Creature {
    CreatureId id_;
    std::optional<CreatureType> type_;
    std::optional<ArmorClass> armorClass_;
    std::unordered_map<SpeedType, Speed> speeds_;
    std::optional<HitPoints> hitPoints_;
public:
    explicit Creature(CreatureId id);
    Creature(CreatureId id, CreatureType type);

    const CreatureId& getId() const noexcept;
    void setId(const CreatureId& id);

    std::optional<CreatureType> getType() const;
    void setType(CreatureType type);

    std::optional<ArmorClass> getArmorClass() const;
    void setArmorClass(const ArmorClass& ac);

    const std::unordered_map<SpeedType, Speed>& getSpeeds() const noexcept;
    void setSpeeds(const std::unordered_map<SpeedType, Speed>& speeds);

    std::optional<HitPoints> getHitPoints() const;
    void setHitPoints(const HitPoints& hp);
};

}
