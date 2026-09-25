#ifndef DE_SOTS_CELLARSANDCENTAURS_APPLICATION_CREATURE_FACADE_H
#define DE_SOTS_CELLARSANDCENTAURS_APPLICATION_CREATURE_FACADE_H

#include "../domain/service/creature_service.h"
#include "../domain/model/creature.h"
#include "../domain/model/creature_type.h"
#include "../domain/model/speed.h"
#include "../domain/model/armor_class.h"

extern const CreatureType CREATURE_FACADE_STANDARD_CREATURE_TYPE;

typedef struct CreatureFacade {
    CreatureService *creature_service;
} CreatureFacade;

typedef struct CreatureSpeeds {
    Speed walking_speed;
    Speed flying_speed;
    Speed swimming_speed;
    Speed burrowing_speed;
    Speed climbing_speed;
} CreatureSpeeds;

CreatureFacade creature_facade_new(CreatureService *creature_service);
Creature *creature_facade_create(CreatureFacade *facade, CreatureType type, CreatureSpeeds speeds,
                                 ArmorClass armor_class, int hit_points_value);

#endif
