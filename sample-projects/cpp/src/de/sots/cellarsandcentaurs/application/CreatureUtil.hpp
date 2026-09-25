#pragma once

#include "../domain/model/Creature.hpp"
#include "../domain/model/Fightable.hpp"
#include "../domain/model/HitPoints.hpp"

namespace de::sots::cellarsandcentaurs::application {

using namespace de::sots::cellarsandcentaurs::domain::model;

class CreatureUtil {
public:
    static constexpr const char* STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor";

    /*
     * Counts the treasure hoard a creature guards.
     */
    static int countTreasureHoard(const Creature& creature) {
        const HitPoints hitPoints = creature.getHitPoints().value_or(HitPoints::init(0));
        return hitPoints.getMax() * 10;
    }
};

}
