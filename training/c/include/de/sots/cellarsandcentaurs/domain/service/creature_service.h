#ifndef DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_CREATURE_SERVICE_H
#define DE_SOTS_CELLARSANDCENTAURS_DOMAIN_SERVICE_CREATURE_SERVICE_H

#include "creatures.h"
#include "../model/creature.h"

typedef struct CreatureService {
    Creatures *creatures;
} CreatureService;

CreatureService creature_service_new(Creatures *creatures);
void creature_service_save(CreatureService *service, Creature *creature);

#endif
