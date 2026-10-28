#include "Creature.hpp"
#include "Dice.hpp"
#include "Global.hpp"

void game::model::Creature::hit() {
    Dice dice{6};
    Stats stats{1};
    (void)dice;
    (void)stats;
}
