#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CREATURE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_MODEL_CREATURE_H

#include "creature_id.h"
#include "creature_type.h"
#include "armor_class.h"
#include "hit_points.h"
#include "speed.h"
#include "movement.h"
#include "fightable.h"

typedef unsigned int XPValue;

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
typedef struct Creature {
    CreatureId id;
    CreatureType type;
    ArmorClass armor_class;
    HitPoints hit_points;
    Speed speeds[SPEED_TYPE_COUNT];
    XPValue xp_value;
    Fightable fightable;
} Creature;

Creature *creature_new(CreatureId id, CreatureType type);
Creature *creature_new_default(CreatureId id);
void creature_free(Creature *creature);

const CreatureId *creature_get_id(const Creature *creature);
CreatureType creature_get_type(const Creature *creature);
void creature_set_type(Creature *creature, CreatureType type);
void creature_set_armor_class(Creature *creature, ArmorClass armor_class);
void creature_set_hit_points(Creature *creature, HitPoints hit_points);
void creature_set_speed(Creature *creature, SpeedType speed_type, Speed speed);
const Speed *creature_get_speed(const Creature *creature, SpeedType speed_type);
const Fightable *creature_as_fightable(const Creature *creature);

#endif
