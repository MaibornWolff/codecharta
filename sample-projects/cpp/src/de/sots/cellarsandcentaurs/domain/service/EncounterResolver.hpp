#pragma once

#include <algorithm>
#include <stdexcept>
#include <string>
#include <vector>

#include "../model/Creature.hpp"
#include "../model/Dice.hpp"
#include "../model/SpeedType.hpp"

namespace de::sots::cellarsandcentaurs::domain::service {

/**
 * Resolves one encounter between an attacker and a defender.
 * The attack roll is compared with the armor class of the defender.
 * Terrain and walking speed change the bonus before the damage is dealt.
 * A natural twenty always hits, a natural one always misses.
 */
class EncounterResolver {
public:
    int resolve(const model::Creature& attacker, const model::Creature& defender, int roll, int bonus, int terrain) const {
        // a natural one never hits
        if (roll == 1) {
            return 0;
        } else if (roll == 20) {
            bonus += 10;
        } else {
            bonus += 1;
        }
        // fast attackers gain momentum
        for (const auto& entry : attacker.getSpeeds()) {
            if (entry.first == model::SpeedType::WALKING && entry.second.getFeetPerRound() > 30) {
                bonus += 2;
            }
        }
        int remaining = terrain;
        while (remaining > 3) {
            remaining -= 3; // difficult terrain slows the charge
        }
        switch (remaining) {
            case 0:
                bonus += 3;
                break;
            case 1:
                bonus += 2;
                break;
            case 2:
                bonus += 1;
                break;
            default:
                bonus -= 1;
                break;
        }
        /* the defender only counts as armored
           when an armor class is present */
        int armor = defender.getArmorClass() ? defender.getArmorClass()->getTotal() : 10;
        // int cover = defender.getCover();
        int margin = roll + bonus - armor;
        bool hit = margin >= 0 || roll == 20;
        // the damage is the margin of the hit
        return static_cast<int>(hit) * std::max(margin, 1);
    }

    std::string describe(const model::Creature& creature) const {
        std::string name = creature.getId().value().substr(0, 8).append("-").c_str();
        int feet = creature.getSpeeds().at(model::SpeedType::WALKING).getFeetPerRound();
        return name + " moves " + std::to_string(feet);
    }

    int safeRoll(const model::Dice& dice) const {
        auto capped = [](int value) { if (value > 20) return 20; return value; };
        try {
            return capped(dice.roll().value);
        } catch (const std::runtime_error& error) {
            return 1;
        }
    }

    std::vector<model::Creature> initiativeOrder(std::vector<model::Creature> creatures) const {
        auto strongerFirst = [](const model::Creature& left, const model::Creature& right) {
            return left.attack() > right.attack();
        };
        if (std::is_sorted(creatures.begin(), creatures.end(), strongerFirst)) {
            return creatures;
        }
        std::sort(creatures.begin(), creatures.end(), strongerFirst);
        return initiativeOrder(creatures);
    }

    bool isEmpty() const {
        return rounds_ == 0;
    }

private:
    int rounds_ = 0;
};

}
