#include <stdlib.h>
#include <string.h>

#include "../../../include/de/sots/cellarsandcentaurs/domain/model/creature.h"
#include "../../../include/de/sots/cellarsandcentaurs/application/application.h"

static int creature_attack(struct Creature *self, struct Creature *target)
{
    int damage = roll_d20() + (int)self->xp_value / 100;
    hit_points_take_damage(&target->hit_points, damage);
    return damage;
}

static int creature_is_alive(const struct Creature *self)
{
    return self->hit_points.current > 0;
}

Creature *creature_new(CreatureId id, CreatureType type)
{
    Creature *creature = calloc(1, sizeof(Creature));
    creature->id = id;
    creature->type = type;
    creature->fightable.attack = creature_attack;
    creature->fightable.is_alive = creature_is_alive;
    return creature;
}

Creature *creature_new_default(CreatureId id)
{
    return creature_new(id, CREATURE_FACADE_STANDARD_CREATURE_TYPE);
}

void creature_free(Creature *creature)
{
    free(creature);
}

const CreatureId *creature_get_id(const Creature *creature)
{
    return &creature->id;
}

CreatureType creature_get_type(const Creature *creature)
{
    return creature->type;
}

void creature_set_type(Creature *creature, CreatureType type)
{
    creature->type = type;
}

void creature_set_armor_class(Creature *creature, ArmorClass armor_class)
{
    creature->armor_class = armor_class;
}

void creature_set_hit_points(Creature *creature, HitPoints hit_points)
{
    creature->hit_points = hit_points;
}

void creature_set_speed(Creature *creature, SpeedType speed_type, Speed speed)
{
    creature->speeds[speed_type] = speed;
}

const Speed *creature_get_speed(const Creature *creature, SpeedType speed_type)
{
    return &creature->speeds[speed_type];
}

const Fightable *creature_as_fightable(const Creature *creature)
{
    return &creature->fightable;
}
