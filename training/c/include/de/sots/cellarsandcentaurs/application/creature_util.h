#ifndef DE_SOTS_CELLARSANDCENTAURS_APPLICATION_CREATURE_UTIL_H
#define DE_SOTS_CELLARSANDCENTAURS_APPLICATION_CREATURE_UTIL_H

#include "../domain/model/model.h"
#include "../domain/model/fightable.h"

#define CREATURE_UTIL_STANDARD_ARMOR_CLASS_DESCRIPTION "Natural Armor"

/*
 * Counts the treasure hoard a creature guards.
 */
int creature_util_count_treasure_hoard(const Creature *creature);
int creature_util_is_centaur(const Creature *creature);

#endif
